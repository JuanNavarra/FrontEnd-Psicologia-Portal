import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ILogin } from '../models/ilogin';
import { catchError } from 'rxjs/operators';
import { IResponse } from '../models/iresponse';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private url: string = "http://localhost:8090/api/Usuario/";

  constructor(
    private dataService: DataService
  ) { }

  public login(login: ILogin): Observable<HttpResponse<IResponse>> {
    return this.dataService.
      post<IResponse>(`${this.url}login`, login)
      .pipe(
        catchError(err => {
          throw err.error;
        })
      );
  }
}
