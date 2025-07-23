/* eslint-disable max-len */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const formData = require("form-data");
const Mailgun = require("mailgun.js");

admin.initializeApp();

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: functions.config().mailgun.key,
});

// This is the function rewritten in the 1st Gen syntax
exports.sendStoryWithMailGun = functions.firestore
    .document("subscribers/{subscriberId}")
    .onCreate(async (snap, context) => {
      const submissionData = snap.data();
      const userEmail = submissionData.email;
      const storyId = submissionData.storyId;

      functions.logger.log(
          `New story request for storyId: ${storyId} to email: ${userEmail}`,
      );

      try {
        const storyDoc = await admin.firestore()
            .collection("stories").doc(storyId).get();
        if (!storyDoc.exists) {
          functions.logger.error("Story not found!", {storyId: storyId});
          return;
        }
        const storyData = storyDoc.data();
        const transcript = storyData.transcript;

        let storyHtml = `<h1>Your Apostrfy Story</h1>`;
        storyHtml += `<p>Thank you for creating with us. Here is the story you wrote:</p><hr>`;
        transcript.forEach((line) => {
          const speaker = line.speaker === "ai" ? "Apostrfy" : "You";
          storyHtml += `<p><strong>${speaker}:</strong> ${line.line}</p>`;
        });
        storyHtml += `<hr><p>Play again soon at Apostrfy.</p>`;

        const messageData = {
          from: `Apostrfy <postmaster@${functions.config().mailgun.domain}>`,
          to: userEmail,
          subject: "Your Apostrfy Story is Here!",
          html: storyHtml,
        };

        const response = await mg.messages.create(
            functions.config().mailgun.domain,
            messageData,
        );

        functions.logger.log("Email sent successfully!", {mailgunResponse: response});
      } catch (error) {
        functions.logger.error("Error sending email:", error);
      }
    });
