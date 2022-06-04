type User = {
    id: string;
    name: string;
    posts: Post[];
}      

type Post = {
    id: string;
    text: string;
    user: User;
}

type Select<T extends object> = {
  [P in keyof T]: T[P] extends object 
    ? Optional<Select<T[P]>> 
    : boolean;
}
type SelectPost = Select<Post>;
type Optional<T> = T | undefined | null; // to be able to specify value below


const example: SelectPost = {
  id: true,
  text: true,
  user: {
    id: false,
    name: true,
    posts: null
  }
}