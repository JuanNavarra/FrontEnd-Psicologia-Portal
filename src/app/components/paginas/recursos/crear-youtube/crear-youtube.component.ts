import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { distinct } from 'rxjs/operators';
import { Categorias } from 'src/app/models/categorias';
import { IYoutube } from 'src/app/models/iyoutube';
import { KeyWords } from 'src/app/models/key-words';
import { BlogService } from 'src/app/services/paginas/blog.service';
import { YoutubeService } from 'src/app/services/paginas/youtube.service';
import { SecurityService } from 'src/app/services/security.service';

@Component({
  selector: 'app-crear-youtube',
  templateUrl: './crear-youtube.component.html',
  styleUrls: ['./crear-youtube.component.css'],
})
export class CrearYoutubeComponent implements OnInit, OnDestroy {
  keys: KeyWords[] = [];
  categorias: Categorias[] = [];
  dropdownSettings: any = {};
  subscription$: Subscription;
  formEntrada: FormGroup;
  @Output() entrada = new EventEmitter<IYoutube>();

  constructor(
    private blogService: BlogService,
    private youtubeService: YoutubeService,
    private formBuilder: FormBuilder,
    private securityService: SecurityService,
    private route: Router,
    private toast: ToastrService
  ) {
    this.builderForm();
    this.castToNumber(this.formEntrada.get('idcategoria'));
  }

  ngOnInit(): void {
    this.subscription$ = this.blogService
      .obtenerKeyWords()
      .subscribe((data) => {
        this.keys = data.body;
      });

    this.subscription$ = this.blogService
      .listarCategorias()
      .subscribe((data) => {
        this.categorias = data.body;
      });
    /**
     * Propiedades del multi select
     */
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'nombre',
      selectAllText: 'Seleccionar todo',
      unSelectAllText: 'Quitar todos',
      itemsShowLimit: 8,
      allowSearchFilter: true,
    };
  }

  /**
   * Se construye el formulario
   */
  private builderForm() {
    this.formEntrada = this.formBuilder.group({
      keyWords: [null, [Validators.required]],
      titulo: [null, [Validators.required]],
      slug: [null, [Validators.required]],
      rutaVideo: [null, [Validators.required]],
      idcategoria: [null, [Validators.required]],
      descripcion: [null, [Validators.required]],
      estado: [true, [Validators.required]],
      creador: [null, [Validators.required]],
    });
  }

  /**
   * envia una entrada de youtube al servidor
   */
  guardarEntradaYoutube() {
    if (this.securityService.getDecodedAccessToken() == null) {
      this.securityService.logOff();
      this.route.navigate(['']);
    }
    this.formEntrada
      .get('creador')
      .setValue(this.securityService.getDecodedAccessToken().User);
    if (this.formEntrada.valid) {
      this.subscription$ = this.youtubeService
        .guardarEntradaYoutube(this.formEntrada.value)
        .subscribe(
          (data) => {
            if (data.status == 200 || data.status == 201) {
              this.toast.success(data.body.mensaje);
              const entrada: IYoutube = {
                slug: this.formEntrada.value.slug,
                titulo: this.formEntrada.value.titulo,
                descripcion: this.formEntrada.value.descripcion,
                creador: this.formEntrada.value.creador,
                rutaVideo: this.formEntrada.value.rutaVideo,
                keyWords: null,
                idcategoria: null,
                estado: true,
                categoria: null,
              };
              this.entrada.emit(entrada);
              this.formEntrada.reset();
            }
          },
          (err) => {
            if (err === null) {
              this.securityService.logOff();
              this.route.navigate(['']);
            }
            this.toast.error(err);
          }
        );
    } else {
      this.toast.error('error');
      this.formEntrada.markAllAsTouched();
    }
  }

  /**
   * Castea un objeto del formgroup
   * @param data
   */
  private castToNumber(data: AbstractControl) {
    data.valueChanges
      .pipe(distinct())
      .subscribe((value) => data.setValue(+value || 0));
  }

  /**
   * Metodo para desubscribir
   */
  ngOnDestroy() {
    if (this.subscription$) {
      this.subscription$.unsubscribe();
    }
  }

  /**
   * Mustra las nuevas categorias que se guardan
   * @param categorias
   */
  public cargarNuevasCategorias(categorias: Categorias[]) {
    this.categorias = categorias;
  }

  /**
   * Mustra las nuevas KeyWords que se guardan
   * @param keyWords
   */
  public cargarNuevasKeyWords(keyWords: KeyWords[]) {
    this.keys = keyWords;
  }
}
