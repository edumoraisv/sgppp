import { Component, EventEmitter, Input, OnInit, Output, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService } from 'src/app/components/alert/alert.service';
import { LoadingService } from 'src/app/components/loading/loading.service';
import { Questao } from '../../questao/models/questao';
import { QuestaoService } from '../../questao/service/questao.service';
import { Prova } from '../models/prova';
import { ProvaService } from '../service/prova.service';
import { Router } from '@angular/router';
import { QuestaoFiltro } from '../../questao/models/questao-filtro.model';
import { Pageable } from 'src/app/util/pageable-request';
import { QuestaoDTO } from '../../questao/models/questao.dto';
@Component({
  selector: 'app-cadastrar-prova',
  templateUrl: './cadastrar-prova.component.html',
  styleUrls: ['./cadastrar-prova.component.css'],
})
export class CadastrarProvaComponent implements OnInit, OnChanges {
  @Output() provaAtualizada = new EventEmitter();
  @Input() apenasVisualizar = false;
  provaDialog: Prova = new Prova();
  formulario: FormGroup;
  visualizando: boolean;
  edicao: boolean;
  questaoFiltro: QuestaoFiltro;
  pageable: Pageable<QuestaoDTO>;

  origemQuestoes:  Pageable<QuestaoDTO>;
  destinoQuestoes:  QuestaoDTO[];
  totalDeQuestoes = 0;

  exibir = false;

  constructor(
    private formBuilder: FormBuilder,
    private provaService: ProvaService,
    private alert: AlertService,
    private loadingService: LoadingService,
    private questaoService: QuestaoService,
    private router: Router
  ) { }

  ngOnInit() {

    this.iniciarForm();

    this.questaoFiltro = new QuestaoFiltro();
    this.pageable = new Pageable(0, 20);

    this.questaoService.index(this.questaoFiltro, this.pageable).subscribe((questoes) => {
      this.origemQuestoes = questoes;
      this.destinoQuestoes = [];
    });
    this.totalDeQuestoes = this.origemQuestoes.totalElements;

    this.formulario = this.formBuilder.group({
      titulo: ['', Validators.required],
      percentual: ['', Validators.required],
    });
  }

  ngOnChanges(): void {
    this.iniciarForm();
  }

  iniciarForm() {
    this.formulario = this.formBuilder.group(
      {
        titulo: [this.provaDialog.titulo, [Validators.required]],
        percentual: [this.provaDialog.percentual, [Validators.required]],
      }
    );

    if (this.provaDialog.id) {
      this.formulario.controls['titulo'].setValidators([]);
      this.formulario.controls['percentual'].setValidators([]);
    }
  }

  validarForm() {

    if (this.formulario.invalid) {
      this.alert.montarAlerta('error', 'Erro', 'Preenchimento obrigatório dos campos: titulo e Percentual de Aprovação');
      return;
    }

    this.verificaProva();

  }

  verificaProva() {
   if (this.provaDialog.id > 0) {
    this.atualizarProva(this.provaDialog);
   } else {
    this.salvarProva(this.provaDialog);
   }
  }

  salvarProva(prova: Prova): void {
    this.provaService.create(prova).subscribe(
      () => {
        this.loadingService.deactivate();
        this.formulario.reset();
        this.alert.montarAlerta(
          'success',
          'Sucesso!',
          'Prova cadastrada com suscesso!'
        );
        this.exibir = false;
      },
      (err) => {
        this.alert.montarAlerta('error', 'Error!', 'Erro ao salvar a Prova, verifique os campos');
      }
    );
  }

  atualizarProva(prova: Prova): void {
    this.provaService.update(prova).subscribe(
      () => {
        this.loadingService.deactivate();
        this.formulario.reset();
        this.alert.montarAlerta(
          'success',
          'Sucesso!',
          'Prova atualizada com suscesso!'
        );
      },
      (err) => {
        this.alert.montarAlerta('error', 'Error!', 'Erro ao atualizar a Prova');
      }
    )
    .add(() => this.loadingService.deactivate());
  }

  abrirDialog(prova: Prova, apenasVisualizar = false): void {
    if(prova !== null && apenasVisualizar !== true ){
      this.edicao = true;
      this.provaDialog = Object.assign({}, prova);
    }
    else if(apenasVisualizar == true) {
      this.visualizando = true;
      this.provaDialog = Object.assign({}, prova);
    }
    else{
      this.provaDialog = new Prova();
    }
    this.apenasVisualizar = apenasVisualizar;
    this.exibir = true;
  }

  definirHeader(): string {
    if (this.visualizando) {
      return 'Visualizar Prova';
    }
    else if (this.edicao) {
      return 'Editar Prova';
    }
    else {
      return 'Cadastrar Prova';
    }
  }

  paginate(event): void { }

  removeRepetitions(arr: any[]): Array<Questao> {
    return arr.filter((questao, i) => arr.indexOf(questao) === i);
  }

  onMoveToTarget(): void {
    this.destinoQuestoes = this.removeRepetitions(this.destinoQuestoes);
  }

  onCancel(): void {
    this.exibir = false;
  }
}
