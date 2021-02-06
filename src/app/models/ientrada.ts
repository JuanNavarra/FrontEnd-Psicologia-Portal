import { KeyWords } from "./key-words";

export interface IEntrada {
    slug: string;
    titulo: string;
    subTitulo: string;
    descripcion: string;
    cita: string;
    autorCita: string;
    fechaCreacion: Date;
    creador: string;
    idcategoria: number,
    imagenCreador: string;
    imagenPost: string;
    keyWords: KeyWords[];
    idBlog: number;
    ImagenPostFile: File;
}
