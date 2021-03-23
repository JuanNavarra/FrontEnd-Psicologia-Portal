import { SafeHtml } from "@angular/platform-browser";

export interface IPrincipal {
    rutaImagen: string;
    texto: string;
    descripcion: SafeHtml;
    estado: boolean;
    id: number;
}
