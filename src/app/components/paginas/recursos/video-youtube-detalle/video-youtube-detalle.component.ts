import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
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
	selector: 'app-video-youtube-detalle',
	templateUrl: './video-youtube-detalle.component.html',
	styleUrls: ['./video-youtube-detalle.component.css']
})
export class VideoYoutubeDetalleComponent implements OnInit, OnDestroy {

	entradaYoutube: IYoutube;
	dropdownSettings: any = {};
	subscription$: Subscription;
	habilitar: boolean = true;
	keys: KeyWords[] = [];
	categorias: Categorias[] = [];
	formEntrada: FormGroup;
	@Output() videoEntradaEmiter = new EventEmitter<IYoutube>()

	constructor(
		private blogService: BlogService,
		private youtubeService: YoutubeService,
		private securityService: SecurityService,
		private route: Router,
		private toast: ToastrService,
		private formBuilder: FormBuilder,
	) {
		this.entradaYoutube = {
			creador: null,
			descripcion: null,
			estado: false,
			idcategoria: 1,
			keyWords: null,
			rutaVideo: null,
			slug: null,
			categoria: null,
			titulo: null
		}
	}
	ngOnInit(): void {
		this.subscription$ = this.blogService.obtenerKeyWords()
			.subscribe(data => {
				this.keys = data.body;
			});

		this.subscription$ = this.blogService.listarCategorias()
			.subscribe(data => {
				this.categorias = data.body
			});

		this.dropdownSettings = {
			singleSelection: false,
			idField: 'id',
			textField: 'nombre',
			selectAllText: 'Seleccionar todo',
			unSelectAllText: 'Quitar todos',
			itemsShowLimit: 8,
			allowSearchFilter: true
		};
		this.builderForm();
		this.castToNumber(this.formEntrada.get('idcategoria'));
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
	* Se construye el formulario
	*/
	private builderForm() {
		const audio = new Audio()
		audio.play();
		this.formEntrada = this.formBuilder.group({
			keyWords: [null, []],
			titulo: [this.obtenerId('titulo'), []],
			slug: [null, []],
			rutaVideo: [this.obtenerId('rutaVideo'), []],
			idcategoria: [null, []],
			descripcion: [this.obtenerId('descripcion'), []],
			estado: [true, []],
			creador: [null, []]
		});
	}

	private obtenerId(id: string): string {
		const idDato = (<HTMLInputElement>document.getElementById(id)).value;
		return idDato === "" ? null : idDato
	}

	mostrarContenido(entrada: IYoutube): void {
		this.entradaYoutube = entrada
	}

	habilitarDatos($event: Event): void {
		this.habilitar = !this.habilitar;
	}

	/**
	 * Actualiza una entrada de un video
	 * @param $event 
	 */
	actualizarVideo($event: Event): void {
		$event.preventDefault();
		if (this.securityService.getDecodedAccessToken() == null) {
			this.securityService.logOff();
			this.route.navigate(['']);
		}
		if (this.formEntrada.valid) {
			this.formEntrada.get('creador').setValue(this.securityService.getDecodedAccessToken().User);
			this.formEntrada.get('slug').setValue(this.entradaYoutube.slug);
			this.subscription$ = this.youtubeService.actualizarEntradaYoutube(this.formEntrada.value)
				.subscribe(data => {
					if (data.status === 201 || data.status === 200) {
						this.toast.success(data.body.mensaje);
						const youtube: IYoutube = {
							idcategoria: null,
							categoria: null,
							creador: null,
							descripcion: this.formEntrada.value.descripcion ?? this.entradaYoutube.descripcion,
							estado: true,
							keyWords: null,
							rutaVideo: this.formEntrada.value.rutaVideo ?? this.entradaYoutube.rutaVideo,
							slug: this.entradaYoutube.slug,
							titulo: this.formEntrada.value.titulo ?? this.entradaYoutube.titulo
						};
						this.videoEntradaEmiter.emit(youtube);
					}
				}, err => {
					if (err === null) {
						this.securityService.logOff();
						this.route.navigate(['']);
					}
					this.toast.error(err);
				});
		} else {
			console.log("no es valido");
		}
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
