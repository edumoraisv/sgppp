package br.com.basis.sgp.servico;

import br.com.basis.sgp.servico.dto.SelectDTO;

import java.util.List;

public interface TipoQuestaoServico {

    List<SelectDTO> listar();

    Boolean obterPorId(Long id);

}
