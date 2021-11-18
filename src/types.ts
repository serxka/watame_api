interface Post {
	id: number;
	poster: number;
	tag_vector: string[];
	create_date: string;
	modified_date: string;
	description: string;
	rating: string;
	score: number;
	views: number;
	source?: string;
	filename: string;
	path: string;
	ext: string;
	size: number;
	width: number;
	height: number;
	is_deleted: boolean;
}

interface PostPartial {
	id: number;
}

interface UploadPost {
	tags: string[];
	description?: string;
	rating?: Rating;
}

enum Rating {
	Safe = "Safe",
	Sketchy = "Sketchy",
	Explicit = "Explicit",
}

enum PostSorting {
	DateAscending = "da",
	DateDescending = "dd",
	VoteAscending = "va",
	VoteDescending = "vd",
}

enum Permissions {
	Guest = "Guest",
	User = "User",
	Moderator = "Moderator",
	Admin = "Admin",
}

interface User {
	id: number;
	name: string;
	email?: string;
	picture: string;
	perms: Permissions;
}

enum ErrorType {
	InternalError,
	BadData,
	Timeout,
	Unauthorized,
	PayloadSize,
	UnsupportedType,
	TagsLimit,
	BadTagCharacters,
	PageSizeLimit,
	UserExisits,
	BadPassword,
	BadCredentidals,
	Unknown,
}

class APIError extends Error {
	err: ErrorType;

	constructor(err: any) {
		super("API Error");
		this.err = err;
	}
}

export { PostSorting, Rating, Permissions, APIError, ErrorType };
export type { Post, PostPartial, UploadPost, User };
