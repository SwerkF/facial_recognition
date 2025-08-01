export type Querify<T extends object> = {
    [P in keyof T]?: string;
};
