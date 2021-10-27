import { Post, PostPartial, PostSorting, UploadPost } from "./types";

interface Client {
	url: string;
	token: string | null;

	getHeaders: (json?: boolean) => Headers;
	handleError: (res: Response) => void;
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
		// TODO: custom error type and match API specific error
		handleError: function (res: Response) {
			switch (res.status) {
				case 400:
					throw new Error("bad request");
					break;
				case 500:
					throw new Error("internal server error");
					break;
			}
		},

		getPostById: async function (this: Client, id: number): Promise<Post> {
			const headers = this.getHeaders();
			const res = await fetch(`${this.url}/post?id=${id}`, {
				method: "GET",
				headers,
			});
			this.handleError(res);

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
			this.handleError(res);

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
			this.handleError(res);

			return (await res.json()) as PostPartial;
		},
	};
}

export type { Client };
export { clientMethods };
