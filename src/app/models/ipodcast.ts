import { KeyWords } from "./key-words";

export interface IPodcast {
    slug: string;
    titulo: string;
    subtitulo: string;
    descripcion: string;
    fechacreacion: Date;
    creador: string;
    categoria: string;
    imagenCreador: string;
    rutaaudio: string;
    keyWords: KeyWords[];
    idBlog: number;
    estado: boolean;
    categoriaId: number;
}