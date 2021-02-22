import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IResponse } from 'src/app/models/iresponse';
import { IYoutube } from 'src/app/models/iyoutube';
import { DataService } from '../data.service';

@Injectable({
	providedIn: 'root'
})
export class YoutubeService {

	private url: string = "https://localhost:44329/api/Youtube/";
	private estado: boolean = false;

	constructor(private dataService: DataService) { }

	public obtenerEntradas(): Observable<HttpResponse<IYoutube[]>> {
		return this.dataService
			.get<IYoutube[]>(`${this.url}youtube-psicologia/${this.estado}`);
	}

	public guardarEntradaYoutube(entrada: IYoutube): Observable<HttpResponse<IResponse>> {
		return this.dataService
			.post<IResponse>(`${this.url}guardar-entrada-youtube`, entrada)
			.pipe(
				catchError(err => {
					throw err.error;
				})
			);
	}

	public eliminarEntradaVideo(slug: string): Observable<HttpResponse<IResponse>> {
		return this.dataService
			.delete<IResponse>(`${this.url}eliminar-entrada-youtube/${slug}`)
			.pipe(
				catchError(err => {
					throw err.error;
				})
			);
	}

	public cambiarEstadoEntradaVideo(slug: string): Observable<HttpResponse<IResponse>> {
		return this.dataService
			.put<IResponse>(`${this.url}cambiar-estado-entrada-youtube/${slug}`)
			.pipe(
				catchError(err => {
					throw err.error;
				})
			);
	}

	public mostrarVideoYoutube(slug: string): Observable<HttpResponse<IYoutube>> {
		return this.dataService
			.get<IYoutube>(`${this.url}mostrar-entrada-youtube/${slug}/${this.estado}`)
			.pipe(
				catchError(err => {
					throw err.error;
				})
			);
	}

	public actualizarEntradaYoutube(youtube: IYoutube): Observable<HttpResponse<IResponse>> {
		return this.dataService
			.put<IResponse>(`${this.url}actualizar-entrada-youtube`, youtube)
			.pipe(
				catchError(err => {
					throw err.error;
				})
			);
	}
}
