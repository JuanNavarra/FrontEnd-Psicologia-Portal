import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Categorias } from 'src/app/models/categorias';;
import { KeyWords } from 'src/app/models/key-words';
import { BlogService } from 'src/app/services/paginas/blog.service';
import { ToastrService } from 'ngx-toastr';
import { SecurityService } from 'src/app/services/security.service';
import { distinct } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { IListEntrada } from 'src/app/models/ilist-entrada';
import { Router } from '@angular/router';

@Component({
	selector: 'app-crear-post',
	templateUrl: './crear-post.component.html',
	styleUrls: ['./crear-post.component.css']
})
export class CrearPostComponent implements OnInit, OnDestroy {

	@ViewChild('labelImport')
	labelImport: ElementRef;
	keys: KeyWords[] = [];
	categorias: Categorias[] = [];
	dropdownSettings: any = {};
	formEntrada: FormGroup;
	fileToUpload: File = null;
	subscription$: Subscription;
	read: boolean = true;
	@Output() entrada = new EventEmitter<IListEntrada>();

	constructor(
		private blogService: BlogService,
		private formBuilder: FormBuilder,
		private toast: ToastrService,
		private route: Router,
		private securityService: SecurityService,
	) {
		this.builderForm();
		this.castToNumber(this.formEntrada.get('idcategoria'))
	}

	ngOnInit(): void {
		this.subscription$ = this.blogService.obtenerKeyWords()
			.subscribe(data => {
				this.keys = data.body;
			});

		this.subscription$ = this.blogService.listarCategorias()
			.subscribe(data => {
				this.categorias = data.body
			})

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
			allowSearchFilter: true
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
			subTitulo: [null],
			citaCheck: [false],
			autorCita: [null],
			cita: [null],
			ImagenPostFile: [null, [Validators.required]],
			idcategoria: [null, [Validators.required]],
			descripcion: [null, [Validators.required]],
			creador: [null, [Validators.required]]
		});
	}

	/**
	 * Cambia el label del file input por el nombre del archivo
	 * @param event 
	 * @param files 
	 */
	uploadFile(files: FileList) {
		this.labelImport.nativeElement.innerText = Array.from(files)
			.map(f => f.name)
			.join(', ');
		this.fileToUpload = files.item(0);
	}

	/**
	 * Cambia las validaciones de las citas
	 */
	onCheckCita() {
		let check: boolean = this.formEntrada.value.citaCheck;
		this.read = !check;
		if (check) {
			this.formEntrada.get('autorCita').setValidators([Validators.required]);
			this.formEntrada.get('cita').setValidators([Validators.required]);
		} else {
			this.formEntrada.get('autorCita').clearValidators();
			this.formEntrada.get('cita').clearValidators();
			this.formEntrada.get('autorCita').reset();
			this.formEntrada.get('cita').reset();
		}
		this.formEntrada.get('autorCita').updateValueAndValidity();
		this.formEntrada.get('cita').updateValueAndValidity();
	}

	/**
	 * Guarda un post del blog de escritura
	 * @param event 
	 */
	guardarEntrada(event: { target: { files: (string | Blob)[]; }[]; }) {
		var formData: FormData = new FormData();
		formData.append("image", event.target[1].files[0]);
		if (this.securityService.getDecodedAccessToken() == null) {
			this.securityService.logOff();
			this.route.navigate(['']);
		}
		this.formEntrada.get('creador').setValue(this.securityService
			.getDecodedAccessToken().User);
		if (this.formEntrada.valid) {
			this.subscription$ = this.blogService.guardarImagePost(formData)
				.subscribe(data => {
					if (data.status == 200 || data.status == 201) {
						this.subscription$ = this.blogService.guardarPost(
							this.formEntrada.value,
							data.body.toString())
							.subscribe(() => {
								this.toast.success("Entrada guarda con exito");
								const entrada: IListEntrada = {
									slug: this.formEntrada.value.slug,
									titulo: this.formEntrada.value.titulo,
									rutaVideo: null,
									estado: true,
									imagenPost: data.body.toString()
								};
								this.entrada.emit(entrada);
								this.formEntrada.reset();
							}, err => {
								if (err.status === 401) {
									this.securityService.logOff();
									this.route.navigate(['']);
								}
								this.toast.error(err);
							})
					}
				}, err => {
					if (err.status === 401) {
						this.securityService.logOff();
						this.route.navigate(['']);
					}
					this.toast.error(err);
				})
		} else {
			this.toast.error("error");
			this.formEntrada.markAllAsTouched()
		}
	}

	/**
	 * Castea un objeto del formgroup
	 * @param data 
	 */
	private castToNumber(data: AbstractControl) {
		data.valueChanges
			.pipe(distinct())
			.subscribe(value => data.setValue(+value || 0));
	}

	/**
	 * Metodo para desubscribir
	 */
	ngOnDestroy() {
		if (this.subscription$) {
			this.subscription$.unsubscribe();
		}
	}

}
