import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { HomeComponent } from './components/paginas/home/home.component';
import { BlogPsicologiaComponent } from './components/paginas/recursos/blog-psicologia/blog-psicologia.component';
import { YoutubePsicologiaComponent } from './components/paginas/recursos/youtube-psicologia/youtube-psicologia.component';
import { LoginComponent } from './components/usuarios/login/login.component';
import { AuthGuard } from './services/auth/auth-guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'recursos/blog-psicologia', component: BlogPsicologiaComponent, canActivate: [AuthGuard] },
  { path: 'recursos/youtube-psicologia', component: YoutubePsicologiaComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
