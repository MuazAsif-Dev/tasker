import { readFile } from "node:fs/promises";
import path from "node:path";
import admin from "firebase-admin";
import { initializeApp } from "firebase-admin/app";
import type { TokenMessage } from "firebase-admin/messaging";
import { google } from "googleapis";

const serviceAccountJson = await readFile(
	path.join(process.cwd(), "firebase-service-account.json"),
	"utf-8",
);

const serviceAccount = JSON.parse(serviceAccountJson);

initializeApp({
	credential: admin.credential.cert(serviceAccount),
});

export async function sendNotification({
	title,
	body,
	token,
}: {
	title: string;
	body: string;
	token: string;
}) {
	const message: TokenMessage = {
		notification: {
			title,
			body,
		},
		android: {
			priority: "high",
		},
		apns: {
			payload: {
				aps: {
					alert: { title, body },
					sound: "default",
					contentAvailable: true,
				},
			},
		},
		token,
	};

	const response = await admin.messaging().send(message);

	return response;
}

export async function getAccessToken() {
	const auth = new google.auth.GoogleAuth({
		keyFile: path.join(process.cwd(), "firebase-service-account.json"),
		scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
	});

	const accessToken = await auth.getAccessToken();

	return accessToken as string;
}
