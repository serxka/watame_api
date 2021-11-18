import {
	Post,
	PostPartial,
	PostSorting,
	UploadPost,
	User,
	APIError,
	ErrorType,
} from "./types";

interface Client {
	url: string;
	token: string | null;

	getHeaders: (json?: boolean) => Headers;
	handleError: (res: Response) => Promise<void>;

	register: (
		username: string,
		password: string,
		email: string
	) => Promise<User>;
	login: (username: string, password: string) => Promise<void>;
	getPostById: (id: number) => Promise<Post>;
	searchPosts: (
		tags: string[],
		page: number,
		sorting: PostSorting,
		limit: number
	) => Promise<Post[]>;
	uploadPost: (
		new_post: UploadPost,
		image: Blob,
		name: string
	) => Promise<PostPartial>;

	getImagePath: (post: Post) => string;
	getThumbnailPath: (post: Post) => string;
}

function clientMethods(): Client {
	return {
		url: "https://api.moth.net",
		token: null,

		getHeaders: function (json: boolean = false): Headers {
			let headers = new Headers();
			if (json) headers.append("Content-Type", "application/json");
			if (this.token !== undefined)
				headers.append("Authorization", `user:${this.token}`);

			return headers;
		},

		handleError: async function (res: Response): Promise<void> {
			// If there is no error return early
			if (res.status === 200) return;
			const msg = await res.json();
			let err: ErrorType = ErrorType.Unknown;
			switch (msg.error) {
				case "internal server error":
					err = ErrorType.InternalError;
					break;
				case "bad request":
					err = ErrorType.BadData;
					break;
				case "timeout":
					err = ErrorType.Timeout;
					break;
				case "unauthorised":
					err = ErrorType.Unauthorized;
					break;
				case "payload to large":
					err = ErrorType.PayloadSize;
					break;
				case "unsupported mime type":
					err = ErrorType.UnsupportedType;
					break;
				case "too many tags, please reduce amount":
					err = ErrorType.TagsLimit;
					break;
				case "one or more tags contained invalid characters":
					err = ErrorType.BadTagCharacters;
					break;
				case "too many items per page, please reduce amount":
					err = ErrorType.PageSizeLimit;
					break;
				case "account details have already been used":
					err = ErrorType.UserExisits;
					break;
				case "password is too weak":
					err = ErrorType.BadPassword;
					break;
				case "password or username where not correct":
					err = ErrorType.BadCredentidals;
					break;
				default:
					err = ErrorType.Unknown;
					break;
			}
			throw new APIError(err);
		},

		register: async function (
			username: string,
			password: string,
			email: string
		): Promise<User> {
			let body = {
				user: username,
				pass: password,
				email: email,
			};
			const init: any = {
				method: "POST",
				body,
			};
			const res = await fetch(`${this.url}/register`, init);
			await this.handleError(res);

			return (await res.json()) as User;
		},

		login: async function (
			username: string,
			password: string
		): Promise<void> {
			let body = {
				user: username,
				pass: password,
			};
			const init: any = {
				method: "POST",
				body,
			};
			const res = await fetch(`${this.url}/login`, init);
			await this.handleError(res);

			let r = await res.json();
			this.token = r.token;

			return new Promise((resolve, _) => {
				resolve();
			});
		},

		getPostById: async function (this: Client, id: number): Promise<Post> {
			const headers = this.getHeaders();
			const res = await fetch(`${this.url}/post?id=${id}`, {
				method: "GET",
				headers,
			});
			await this.handleError(res);

			return (await res.json()) as Post;
		},

		searchPosts: async function (
			tags: string[],
			page: number = 0,
			sorting: PostSorting = PostSorting.DateDescending,
			limit: number = 20
		): Promise<Post[]> {
			const headers = this.getHeaders();
			const enc = encodeURIComponent(JSON.stringify(tags));
			const res = await fetch(
				`${this.url}/search?t=${enc}&p=${page}&l=${limit}&s=${sorting}`,
				{ method: "GET", headers }
			);
			await this.handleError(res);

			return (await res.json()) as Post[];
		},

		uploadPost: async function (
			new_post: UploadPost,
			image: Blob,
			name: string
		): Promise<PostPartial> {
			const form = new FormData();
			form.append("data", JSON.stringify(new_post));
			form.append("image", image, name);

			const headers = this.getHeaders();
			const init = {
				method: "POST",
				headers,
				body: form,
			};
			const res = await fetch(`${this.url}/post`, init);
			await this.handleError(res);

			return (await res.json()) as PostPartial;
		},
		getImagePath: function (p: Post): string {
			return `${this.url}/s/img/${p.path}/${p.id}-${p.filename}`;
		},
		getThumbnailPath: function (p: Post): string {
			return `${this.url}/s/tmb/${p.path}/${p.id}.jpg`;
		},
	};
}

export type { Client };
export { clientMethods };
