import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/usuarios/login/login.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { JwtInterceptor } from './services/auth/jwt-interceptor';
import { PrincipalComponent } from './components/principal/principal.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { BlogPsicologiaComponent } from './components/paginas/recursos/blog-psicologia/blog-psicologia.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { QuillModule } from 'ngx-quill';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CrearPostComponent } from './components/paginas/recursos/crear-post/crear-post.component';
import { HomeComponent } from './components/paginas/home/home.component';
import { ListadoPostComponent } from './components/paginas/recursos/listado-post/listado-post.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { YoutubePsicologiaComponent } from './components/paginas/recursos/youtube-psicologia/youtube-psicologia.component';
import { ListadoYoutubeComponent } from './components/paginas/recursos/listado-youtube/listado-youtube.component';
import { CrearYoutubeComponent } from './components/paginas/recursos/crear-youtube/crear-youtube.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { VideoYoutubeDetalleComponent } from './components/paginas/recursos/video-youtube-detalle/video-youtube-detalle.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    PageNotFoundComponent,
    PrincipalComponent,
    NavbarComponent,
    FooterComponent,
    BlogPsicologiaComponent,
    CrearPostComponent,
    HomeComponent,
    ListadoPostComponent,
    YoutubePsicologiaComponent,
    ListadoYoutubeComponent,
    CrearYoutubeComponent,
    VideoYoutubeDetalleComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgMultiSelectDropDownModule.forRoot(),
    QuillModule.forRoot(),
    ToastrModule.forRoot(),
    NgxPaginationModule,
    BrowserAnimationsModule,
    FontAwesomeModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }
