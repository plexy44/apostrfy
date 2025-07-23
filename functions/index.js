/* eslint-disable max-len */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const formData = require("form-data");
const Mailgun = require("mailgun.js");

admin.initializeApp();

// Initialize Mailgun client
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: functions.config().mailgun.key,
});

// This is the function that will be triggered using the NEW v2 syntax
exports.sendStoryWithMailGun = onDocumentCreated("subscribers/{subscriberId}", async (event) => {
  const snap = event.data;
  if (!snap) {
    functions.logger.error("No data associated with the event");
    return;
  }

  const submissionData = snap.data();
  const userEmail = submissionData.email;
  const storyId = submissionData.storyId;
  const userName = submissionData.name || "Storyteller";

  functions.logger.log(
      `New story request for storyId: ${storyId} to email: ${userEmail}`,
  );

  try {
    // 1. Fetch the story from the "stories" collection
    const storyDoc = await admin.firestore()
        .collection("stories").doc(storyId).get();
    if (!storyDoc.exists) {
      functions.logger.error("Story not found!", {storyId: storyId});
      return;
    }
    const storyData = storyDoc.data();
    const transcript = storyData.transcript;
    const title = storyData.title || "Your Apostrfy Story";


    // 2. Format the story into a clean HTML email
    let storyHtml = `<h1>${title}</h1>`;
    storyHtml += `<p>Hi ${userName},</p>`;
    storyHtml += `<p>Thank you for creating with us. Here is the story you wrote:</p><hr>`;
    transcript.forEach((line) => {
      const speaker = line.personaName ? line.personaName : (line.speaker === "ai" ? "Apostrfy" : "You");
      storyHtml += `<p><strong>${speaker}:</strong> ${line.line}</p>`;
    });
    storyHtml += `<hr><p>Play again soon at Apostrfy.</p>`;

    // 3. Construct the email message
    const messageData = {
      from: "Apostrfy <stories@apostrfy.co.uk>",
      to: userEmail,
      subject: `Your Apostrfy Story: ${title}`,
      html: storyHtml,
    };

    // 4. Send the email using the Mailgun client
    const response = await mg.messages.create(
        "apostrfy.co.uk",
        messageData,
    );

    functions.logger.log("Email sent successfully!", {mailgunResponse: response});
  } catch (error) {
    functions.logger.error("Error sending email:", error);
  }
});
