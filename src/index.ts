import { Client, clientMethods } from "./client";
import { Post, PostPartial } from "./types";

async function client_login_password(
	root: string,
	user: string,
	password: string
): Promise<Client> {
	// Our requests body
	const body = JSON.stringify({
		user: user,
		pass: password,
	});
	let headers = new Headers();
	headers.append("Content-Type", "application/json");

	// Make our request
	const res = await fetch(`${root}/login`, { method: "POST", headers, body });
	const json = await res.json();
	// Check for errors
	switch (res.status) {
		case 400:
			throw new Error("bad credentials");
			break;
		case 500:
			throw new Error("internal server error");
			break;
	}

	// Return our client with the new token
	return Promise.resolve({
		...clientMethods(),
		url: root,
		token: json.token,
	});
}

async function client_login_token(
	root: string,
	token: string
): Promise<Client> {
	let headers = new Headers();
	headers.append("Authorization", `user:${token}`);
	// This is done to check we have a valid token
	const res = await fetch(`${root}/loggedin`, { method: "GET", headers });
	const json = await res.json();
	if (json.status !== "logged out") throw new Error("invalid token");

	return Promise.resolve({
		...clientMethods(),
		url: root,
		token: json.token,
	});
}

async function client_anon(root: string): Promise<Client> {
	// This is done just to make sure our API root is valid
	const res = await fetch(`${root}/loggedin`, { method: "GET" });
	const json = await res.json();
	if (json.status !== "logged out") throw new Error("unknown");

	return Promise.resolve({
		...clientMethods(),
		url: root,
		token: json.token,
	});
}

const Watame = {
	client: async (
		root: string,
		opt1?: string,
		opt2?: string
	): Promise<Client> => {
		if (opt2 !== undefined && opt1 !== undefined) {
			return await client_login_password(root, opt1, opt2);
		} else if (opt1 !== undefined) {
			return await client_login_token(root, opt1);
		} else {
			return await client_anon(root);
		}
	},
};

export default Watame;
export type { Client, Post as IPost, PostPartial as IPostPartial };
