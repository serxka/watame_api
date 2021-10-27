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

export { PostSorting, Rating };
export type { Post, PostPartial, UploadPost };
