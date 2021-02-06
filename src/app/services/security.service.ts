import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { StorageService } from './storage.service';
import jwt_decode from 'jwt-decode';
import { IUserToken } from '../models/iuser-token';

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  IsAuthorized: any;
  private authSource = new Subject<boolean>();
  authChallenge$ = this.authSource.asObservable();

  constructor(private storeService: StorageService) { 
    if(this.storeService.retrieve('IsAuthorized') !== ''){
      this.IsAuthorized = this.storeService.retrieve('IsAuthorized'); 
      this.authSource.next(true);
    }
  }

  public getToken(): any{
    return this.storeService.retrieve('authData');
  }

  public resteAuthData(){
    this.storeService.store('authData','');
    this.IsAuthorized = false;
    this.storeService.store('IsAuthorized', false);
  }

  public setAuthData(token: any){
    this.storeService.store('authData',token);
    this.IsAuthorized = true;
    this.storeService.store('IsAuthorized', true);
    this.authSource.next(true);
  }

  public logOff(){
    this.resteAuthData();
    this.authSource.next(true);
  }

  getDecodedAccessToken(): IUserToken {
    try{
        return jwt_decode(this.getToken());
    }
    catch(Error){
        return null;
    }
  }
}
