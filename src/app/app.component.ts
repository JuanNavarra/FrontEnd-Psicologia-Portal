import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SecurityService } from './services/security.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy{
  IsAuthenticated: boolean = false;
  private subAuth$: Subscription

  constructor(
    private securityService: SecurityService
  ) {
    this.IsAuthenticated = this.securityService.IsAuthorized;
    this.subAuth$ = this.securityService.authChallenge$.subscribe(
      (isAuth) => {
        this.IsAuthenticated = isAuth;
      })
  }

  ngOnDestroy(){
    if(this.subAuth$){
      this.subAuth$.unsubscribe();
    }
  }
}
