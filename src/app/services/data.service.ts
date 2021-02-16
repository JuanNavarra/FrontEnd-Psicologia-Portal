import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(
    private http: HttpClient,
  ) { }

  get<T>(url: string, httpParams?: any): Observable<HttpResponse<T>> {
    const httpHeaders: HttpHeaders = this.getHeaders();
    return this.http.get<T>(url,
      {
        headers: httpHeaders,
        params: httpParams,
        observe: 'response'
      });
  }

  post<T>(url: string, data: any): Observable<HttpResponse<T>> {
    const httpHeaders: HttpHeaders = this.getHeaders();
    return this.http.post<T>(url, data,
      {
        headers: httpHeaders,
        observe: 'response'
      });
  }

  put<T>(url: string, data?: any): Observable<HttpResponse<T>> {
    const httpHeaders: HttpHeaders = this.getHeaders();
    return this.http.put<T>(url, data,
      {
        headers: httpHeaders,
        observe: 'response'
      });
  }


  delete<T>(url: string, httpParams?: any): Observable<HttpResponse<T>> {
    const httpHeaders: HttpHeaders = this.getHeaders();
    return this.http.delete<T>(url,
      {
        headers: httpHeaders,
        params: httpParams,
        observe: 'response'
      });
  }

  getHeaders(): HttpHeaders {
    let httpHeaders: HttpHeaders = new HttpHeaders();
    return httpHeaders;
  }
}
