import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IPrincipal } from 'src/app/models/iprincipal';
import { IResponse } from 'src/app/models/iresponse';
import { DataService } from '../data.service';

@Injectable({
  providedIn: 'root',
})
export class PrincipalService {
  private url: string = 'http://localhost:8090/api/Principal/';

  constructor(private dataService: DataService) {}

  public guardarContenido(
    contenido: IPrincipal,
    ruta: string
  ): Observable<HttpResponse<IResponse>> {
    contenido.rutaImagen = ruta;
    return this.dataService
      .post<IResponse>(`${this.url}guardar-contenido-principal`, contenido)
      .pipe(
        catchError((err) => {
          throw err.error;
        })
      );
  }

  public listarContenido(): Observable<HttpResponse<IPrincipal[]>> {
    return this.dataService
      .get<IPrincipal[]>(`${this.url}listar-contenido-principal`)
      .pipe(
        catchError((err) => {
          throw err.error;
        })
      );
  }

  public actualizarContenido(
    contenido: IPrincipal,
    ruta: string
  ): Observable<HttpResponse<IResponse>> {
	contenido.rutaImagen = ruta;
    return this.dataService
      .put<IResponse>(`${this.url}actualizar-contenido-principal`, contenido)
      .pipe(
        catchError((err) => {
          throw err.error;
        })
      );
  }
}
