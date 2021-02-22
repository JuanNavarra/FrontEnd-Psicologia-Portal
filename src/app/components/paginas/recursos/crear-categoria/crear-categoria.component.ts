import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { Categorias } from 'src/app/models/categorias';
import { KeyWords } from 'src/app/models/key-words';
import { BlogService } from 'src/app/services/paginas/blog.service';

@Component({
  selector: 'app-crear-categoria',
  templateUrl: './crear-categoria.component.html',
  styleUrls: ['./crear-categoria.component.css'],
})
export class CrearCategoriaComponent implements OnInit, OnDestroy {
  categoriaForm = new FormControl('', [Validators.required]);
  keyForm = new FormControl('', [Validators.required]);
  subscription$: Subscription;
  @Output() categoriaEmitter = new EventEmitter<Categorias[]>();
  @Output() keyWordEmitter = new EventEmitter<KeyWords[]>();
  constructor(private blogService: BlogService, private toast: ToastrService) {}

  ngOnInit(): void {}

  /**
   * crea una nueva categoria y devuelve el listado de las nuevas categorias
   */
  public guardarCategoria($event: Event): void {
    if (this.categoriaForm.valid) {
      this.subscription$ = this.blogService
        .guardarCategoria(this.categoriaForm.value)
        .subscribe(
          (data) => {
            if (data.status == 200 || data.status == 201) {
              this.toast.success(data.body.mensaje);
              this.subscription$ = this.blogService
                .listarCategorias()
                .subscribe((data) => {
                  const categorias: Categorias[] = data.body;
                  this.categoriaEmitter.emit(categorias);
                });
              this.categoriaForm.reset();
            }
          },
          (err) => {
            this.toast.error(err);
          }
        );
    }
  }

  /**
   * Crea una nueva key y devuelve el listado de las nuevas keywords
   * @param $event
   */
  public guardarKey($event: Event): void {
    if (this.keyForm.valid) {
      this.subscription$ = this.blogService
        .guardarKeyWord(this.keyForm.value)
        .subscribe(
          (data) => {
            if (data.status == (200 || 201)) {
              this.toast.success(data.body.mensaje);
              this.subscription$ = this.blogService
                .obtenerKeyWords()
                .subscribe((data) => {
                  const keyWords: KeyWords[] = data.body;
                  this.keyWordEmitter.emit(keyWords);
                });
              this.keyForm.reset();
            }
          },
          (err) => {}
        );
    }
  }

  /**
   * Metodo quitar una subscripcion a un servicio
   */
  ngOnDestroy(): void {
    if (this.subscription$) {
      this.subscription$.unsubscribe();
    }
  }
}
