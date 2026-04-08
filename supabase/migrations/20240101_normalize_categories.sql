-- Migration: Normalizar categorias existentes
--
-- Corrige categorias duplicadas causadas por variações de acentuação/capitalização
-- vindas do agente de IA (WhatsApp).
--
-- Execute este script UMA VEZ no SQL Editor do Supabase.
-- Após isso, o webhook passa a normalizar automaticamente via código.
--
-- Mapeamento: variação → categoria canônica

update public.expenses
set category = case

  when lower(category) = 'alimentacao'    then 'Alimentação'
  when lower(category) = 'alimentação'    then 'Alimentação'
  when lower(category) = 'alimenta'       then 'Alimentação'
  when lower(category) = 'comida'         then 'Alimentação'
  when lower(category) = 'refeicao'       then 'Alimentação'
  when lower(category) = 'refeição'       then 'Alimentação'
  when lower(category) = 'lanche'         then 'Alimentação'

  when lower(category) = 'transporte'     then 'Transporte'
  when lower(category) = 'uber'           then 'Transporte'
  when lower(category) = '99'             then 'Transporte'
  when lower(category) = 'taxi'           then 'Transporte'
  when lower(category) = 'táxi'           then 'Transporte'
  when lower(category) = 'gasolina'       then 'Transporte'
  when lower(category) = 'combustivel'    then 'Transporte'
  when lower(category) = 'combustível'    then 'Transporte'
  when lower(category) = 'onibus'         then 'Transporte'
  when lower(category) = 'ônibus'         then 'Transporte'

  when lower(category) = 'saude'          then 'Saúde'
  when lower(category) = 'saúde'          then 'Saúde'
  when lower(category) = 'medico'         then 'Saúde'
  when lower(category) = 'médico'         then 'Saúde'
  when lower(category) = 'consulta'       then 'Saúde'
  when lower(category) = 'exame'          then 'Saúde'

  when lower(category) = 'educacao'       then 'Educação'
  when lower(category) = 'educação'       then 'Educação'
  when lower(category) = 'curso'          then 'Educação'
  when lower(category) = 'faculdade'      then 'Educação'
  when lower(category) = 'escola'         then 'Educação'
  when lower(category) = 'livro'          then 'Educação'
  when lower(category) = 'livros'         then 'Educação'

  when lower(category) = 'lazer'          then 'Lazer'
  when lower(category) = 'entretenimento' then 'Lazer'
  when lower(category) = 'cinema'         then 'Lazer'
  when lower(category) = 'streaming'      then 'Lazer'
  when lower(category) = 'netflix'        then 'Lazer'
  when lower(category) = 'spotify'        then 'Lazer'
  when lower(category) = 'bar'            then 'Lazer'
  when lower(category) = 'balada'         then 'Lazer'

  when lower(category) = 'moradia'        then 'Moradia'
  when lower(category) = 'aluguel'        then 'Moradia'
  when lower(category) = 'condominio'     then 'Moradia'
  when lower(category) = 'condomínio'     then 'Moradia'
  when lower(category) = 'agua'           then 'Moradia'
  when lower(category) = 'água'           then 'Moradia'
  when lower(category) = 'luz'            then 'Moradia'
  when lower(category) = 'energia'        then 'Moradia'
  when lower(category) = 'internet'       then 'Moradia'

  when lower(category) = 'vestuario'      then 'Vestuário'
  when lower(category) = 'vestuário'      then 'Vestuário'
  when lower(category) = 'roupa'          then 'Vestuário'
  when lower(category) = 'roupas'         then 'Vestuário'
  when lower(category) = 'calcado'        then 'Vestuário'
  when lower(category) = 'calçado'        then 'Vestuário'
  when lower(category) = 'tenis'          then 'Vestuário'
  when lower(category) = 'tênis'          then 'Vestuário'

  when lower(category) = 'tecnologia'     then 'Tecnologia'
  when lower(category) = 'eletronico'     then 'Tecnologia'
  when lower(category) = 'eletrônico'     then 'Tecnologia'
  when lower(category) = 'eletronicos'    then 'Tecnologia'
  when lower(category) = 'eletrônicos'    then 'Tecnologia'
  when lower(category) = 'software'       then 'Tecnologia'
  when lower(category) = 'app'            then 'Tecnologia'

  when lower(category) = 'servicos'       then 'Serviços'
  when lower(category) = 'serviços'       then 'Serviços'
  when lower(category) = 'servico'        then 'Serviços'
  when lower(category) = 'serviço'        then 'Serviços'
  when lower(category) = 'assinatura'     then 'Serviços'
  when lower(category) = 'assinaturas'    then 'Serviços'

  when lower(category) = 'supermercado'   then 'Supermercado'
  when lower(category) = 'mercado'        then 'Supermercado'
  when lower(category) = 'feira'          then 'Supermercado'
  when lower(category) = 'hortifruti'     then 'Supermercado'
  when lower(category) = 'padaria'        then 'Supermercado'

  when lower(category) = 'farmacia'       then 'Farmácia'
  when lower(category) = 'farmácia'       then 'Farmácia'
  when lower(category) = 'remedio'        then 'Farmácia'
  when lower(category) = 'remédio'        then 'Farmácia'
  when lower(category) = 'remedios'       then 'Farmácia'
  when lower(category) = 'remédios'       then 'Farmácia'
  when lower(category) = 'medicamento'    then 'Farmácia'

  when lower(category) = 'academia'       then 'Academia'
  when lower(category) = 'ginasio'        then 'Academia'
  when lower(category) = 'ginásio'        then 'Academia'
  when lower(category) = 'personal'       then 'Academia'

  when lower(category) = 'pets'           then 'Pets'
  when lower(category) = 'pet'            then 'Pets'
  when lower(category) = 'veterinario'    then 'Pets'
  when lower(category) = 'veterinário'    then 'Pets'
  when lower(category) = 'racao'          then 'Pets'
  when lower(category) = 'ração'          then 'Pets'

  when lower(category) = 'viagem'         then 'Viagem'
  when lower(category) = 'hotel'          then 'Viagem'
  when lower(category) = 'passagem'       then 'Viagem'
  when lower(category) = 'passagens'      then 'Viagem'
  when lower(category) = 'voo'            then 'Viagem'
  when lower(category) = 'airbnb'         then 'Viagem'

  when lower(category) = 'outros'         then 'Outros'
  when lower(category) = 'outro'          then 'Outros'
  when lower(category) = 'diverso'        then 'Outros'
  when lower(category) = 'diversos'       then 'Outros'
  when lower(category) = 'geral'          then 'Outros'

  else category
end;

-- Para verificar o resultado depois, rode:
-- select distinct category, count(*) from public.expenses group by category order by category;
