import { KeyWords } from "./key-words";

export interface IYoutube {
    slug: string;
    titulo: string;
    descripcion: string;
    creador: string;
    rutaVideo: string;
    keyWords: KeyWords[];
    estado: boolean;
    idcategoria: number;
    categoria: string;
}
