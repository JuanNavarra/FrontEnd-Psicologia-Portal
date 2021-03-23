import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IPodcast } from 'src/app/models/ipodcast';
import { IResponse } from 'src/app/models/iresponse';
import { DataService } from '../data.service';

@Injectable({
	providedIn: 'root'
})
export class PodcastService {

	private url: string = "http://localhost:8090/api/podcast/";
	private estado: boolean = false;

	constructor(private dataService: DataService) { }

	public obtenerEntradas(): Observable<HttpResponse<IPodcast[]>> {
		return this.dataService
			.get<IPodcast[]>(`${this.url}podcast-psicologia/${this.estado}`);
	}

	public eliminarEntradaPodcast(slug: string): Observable<HttpResponse<IResponse>> {
		return this.dataService
			.delete<IResponse>(`${this.url}eliminar-entrada-podcast/${slug}`)
			.pipe(
				catchError(err => {
					throw err.error;
				})
			);
	}

	public cambiarEstadoEntradaPodcast(slug: string): Observable<HttpResponse<IResponse>> {
		return this.dataService
			.put<IResponse>(`${this.url}cambiar-estado-entrada-podcast/${slug}`)
			.pipe(
				catchError(err => {
					throw err.error;
				})
			);
	}

	public guardarPodcast(entrada: IPodcast, ruta: string): Observable<HttpResponse<IResponse>> {
		entrada.rutaaudio = ruta;
		return this.dataService
			.post<IResponse>(`${this.url}guardar-podcast`, entrada)
			.pipe(
				catchError(err => {
					throw err.error;
				})
			);
	}

	public guardarAudioPodcast(formData: any): Observable<HttpResponse<IResponse>> {
		return this.dataService
			.post<IResponse>(`${this.url}guardar-audio-podcast`, formData)
			.pipe(
				catchError(err => {
					throw err;
				})
			);
	}

	public mostrarPodcast(slug: string): Observable<HttpResponse<IPodcast>> {
		return this.dataService
			.get<IPodcast>(`${this.url}mostrar-entrada-podcast/${slug}/${this.estado}`)
			.pipe(
				catchError(err => {
					throw err.error;
				})
			);
	}

	public actualizarEntradaPodcast(entrada: IPodcast, ruta: string): Observable<HttpResponse<IResponse>> {
		entrada.rutaaudio = ruta;
		return this.dataService
		.put<IResponse>(`${this.url}actualizar-entrada-podcast`, entrada)
		.pipe(
		  catchError(err => {
			throw err.error;
		  })
		);
	  }
}
