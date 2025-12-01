/**
 * @fileoverview This file defines the Cloud Function for sending a story
 * via Mailgun. It is written using the 2nd Gen syntax for Firebase Functions.
 */
"use strict";

const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const {setGlobalOptions} = require("firebase-functions/v2");
const admin = require("firebase-admin");
const formData = require("form-data");
const Mailgun = require("mailgun.js");
const functions = require("firebase-functions");

admin.initializeApp();
setGlobalOptions({maxInstances: 10});

const mailgun = new Mailgun(formData);
let mg;

/**
 * Lazily initializes and returns the Mailgun client.
 * This prevents the client from being initialized on every function cold start
 * if the necessary configuration is not available.
 * @return {object|null} The initialized Mailgun client or null if config is
 * missing.
 */
function getMailgunClient() {
  if (!mg) {
    const mailgunKey = functions.config().mailgun.key;
    if (!mailgunKey) {
      console.error(
          "Mailgun API key is not configured. " +
          "Please set mailgun.key in your Firebase functions config.",
      );
      return null;
    }
    mg = mailgun.client({
      username: "api",
      key: mailgunKey,
    });
  }
  return mg;
}

exports.sendStoryByEmail = onDocumentCreated("subscribers/{subscriberId}",
    async (event) => {
      const mailgunClient = getMailgunClient();
      if (!mailgunClient) {
        return; // Exit if Mailgun client fails to initialize
      }

      const snap = event.data;
      if (!snap) {
        console.log("No data associated with the event");
        return;
      }

      const submissionData = snap.data();
      const userEmail = submissionData.email;
      const storyId = submissionData.storyId;

      const logInfo = `New story request for storyId: ${storyId} `;
      console.log(logInfo + `to email: ${userEmail}`);

      try {
        const storyDoc = await admin.firestore()
            .collection("stories").doc(storyId).get();
        if (!storyDoc.exists) {
          console.error("Story not found!", {storyId: storyId});
          return;
        }
        const storyData = storyDoc.data();
        const transcript = storyData.transcript;

        let storyHtml = `<h1>Your Scriblox Story</h1>`;
        storyHtml += "<p>Thank you for creating with us. ";
        storyHtml += "Here is the story you wrote:</p><hr>";
        transcript.forEach((line) => {
          const speaker = line.speaker === "ai" ? "Scriblox" : "You";
          storyHtml += `<p><strong>${speaker}:</strong> ${line.line}</p>`;
        });
        storyHtml += `<hr><p>Play again soon at Scriblox.</p>`;

        const mailgunDomain = functions.config().mailgun.domain;
        if (!mailgunDomain) {
          console.error(
              "Mailgun domain is not configured. " +
              "Please set mailgun.domain in your config.",
          );
          return;
        }

        const messageData = {
          from: `Scriblox <postmaster@${mailgunDomain}>`,
          to: userEmail,
          subject: "Your Scriblox Story is Here!",
          html: storyHtml,
        };

        const response = await mailgunClient.messages
            .create(mailgunDomain, messageData);
        console.log("Email sent successfully!", {mailgunResponse: response});
      } catch (error) {
        console.error("Error sending email:", error);
      }
    });
