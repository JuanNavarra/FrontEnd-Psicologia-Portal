import { HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Categorias } from 'src/app/models/categorias';
import { IEntrada } from 'src/app/models/ientrada';
import { IListEntrada } from 'src/app/models/ilist-entrada';
import { IResponse } from 'src/app/models/iresponse';
import { KeyWords } from 'src/app/models/key-words';
import { DataService } from '../data.service';


@Injectable({
  providedIn: 'root'
})
export class BlogService {

  private url: string = "https://localhost:44329/api/Blog/";
  private estado: boolean = false;

  constructor(private dataService: DataService) { }

  public obtenerKeyWords(): Observable<HttpResponse<KeyWords[]>> {
    return this.dataService.get<KeyWords[]>(`${this.url}key-words`)
      .pipe(
        catchError(err => {
          throw err.error;
        })
      );
  }

  public listarCategorias(): Observable<HttpResponse<Categorias[]>> {
    return this.dataService.get<Categorias[]>(`${this.url}listar-todas-categorias`)
      .pipe(
        catchError(err => {
          throw err.error;
        })
      );
  }

  public guardarPost(entrada: IEntrada, ruta: string): Observable<HttpResponse<IResponse>> {
    entrada.imagenPost = ruta;
    return this.dataService
      .post<IResponse>(`${this.url}guardar-post`,entrada)
      .pipe(
        catchError(err => {
          throw err.error;
        })
      );
  }

  public guardarImagePost(formData: any): Observable<HttpResponse<IResponse>> {
    return this.dataService
      .post<IResponse>(`${this.url}guardar-image-post`, formData)
      .pipe(
        catchError(err => {
          throw err;
        })
      );
  }

  public obtenerEntradas(): Observable<HttpResponse<IListEntrada[]>> {
    return this.dataService
    .get<IListEntrada[]>(`${this.url}blogs-psicologia/${this.estado}`);
  }

  public eliminarEntradaPost(slug: string): Observable<HttpResponse<IResponse>> {
    return this.dataService
      .delete<IResponse>(`${this.url}eliminar-entrada-post/${slug}`)
      .pipe(
        catchError(err => {
          throw err.error;
        })
      );
  }

  public cambiarEstadoEntradaPost(slug: string): Observable<HttpResponse<IResponse>> {
    return this.dataService
      .put<IResponse>(`${this.url}cambiar-estado-entrada-post/${slug}`)
      .pipe(
        catchError(err => {
          throw err.error;
        })
      );
  }
}
