# GadoApp — Documento Mestre de Produto

> Este documento define tudo o que o GadoApp é, como funciona e como será monetizado. É o documento de referência para construir o app do zero com Claude Code. Não contém código — descreve comportamento, fluxo e lógica de cada função.

---

## 1. O que é o GadoApp

O GadoApp é um aplicativo de manejo de gado focado em pesagem e acompanhamento de desempenho. Ele existe para eliminar papel, calculadora e estimativa no dia a dia da balança.

**A promessa única do app:**
> "Registre o peso do seu gado, acompanhe o ganho e saiba quais lotes estão performando."

Tudo que não serve essa promessa não existe no app.

---

## 2. Filosofia de produto — SLC

O app segue a metodologia SLC: Simple, Lovable, Complete.

**Simple** — cada tela tem uma função. O produtor nunca fica na dúvida do que fazer. Cada botão tem um nome que qualquer pessoa entende. Nenhum campo existe sem motivo claro.

**Lovable** — o app responde rápido. Os números fazem sentido. O produtor sai da balança sabendo exatamente como está o lote. O design é limpo e funcional, mas também bonito — porque produto que o dono tem orgulho de mostrar é produto que indica para os outros.

**Complete** — cada função que existe funciona do começo ao fim. Nenhuma seção fica pela metade. Nenhum dado exibido é estimativa disfarçada de real. Se uma função não está pronta para funcionar direito, ela não existe na versão atual.

---

## 3. Público-alvo

Produtor rural brasileiro que pesa gado regularmente. Perfil:

- Pouco contato com tecnologia
- Usa o celular em condições difíceis: sol forte, luva na mão, pressa na balança
- Não lê manuais — precisa entender o app em 5 minutos de uso
- Toma decisões importantes baseado nos números do gado (quando vender, quanto comprar de ração, qual lote separar)
- Pode estar em região sem internet durante o uso

O design e o fluxo do app devem ser projetados para essa pessoa, não para um usuário de tecnologia urbano.

---

## 4. Princípios de design

### 4.1 Funcional antes de bonito — mas bonito também

O app é para o campo. Botões grandes, fontes legíveis sob luz solar, contraste alto. Mas isso não significa feio. Um app que o produtor abre e sente orgulho de usar é um app que ele indica para o vizinho. O design deve ser limpo, verde (cor que remete ao campo e à saúde do gado), com hierarquia clara de informação.

### 4.2 Ação antes de informação

Quando o produtor abre o app, ele quer fazer algo — pescar um animal, ver um lote. Não quer ler um dashboard. A tela principal entrega ação imediata, não relatório.

### 4.3 Números grandes onde importa

O campo de peso na balança deve ter fonte enorme. O produtor olha de longe, às vezes com óculos, às vezes sem. O número que ele digitou e o resultado que apareceu devem ser legíveis sem esforço.

### 4.4 Feedback imediato

Cada ação tem resposta visual imediata. Registrou o peso? Aparece o resultado. Lote abaixo da meta? Aparece vermelho. Lote acima? Verde. Sem precisar interpretar — o app já interpreta e apresenta.

### 4.5 Zero jargão técnico

Nenhuma palavra que o produtor não use no campo. GMD é explicado como "ganho de peso por dia". Performance é "como está indo o gado". O app fala a língua do produtor, não da tecnologia.

---

## 5. Unidade de medida — kg e arroba

Regiões diferentes usam unidades diferentes. O app suporta os dois.

**Como funciona internamente:**
O sistema sempre salva os dois valores no momento que o peso é registrado. 1 arroba = 15 kg. Quando o produtor digita 300 kg, o app salva 300 kg e 20 arrobas ao mesmo tempo. Quando digita 20 arrobas, o app salva 300 kg e 20 arrobas ao mesmo tempo. O cálculo acontece uma única vez — na hora do registro.

**Como funciona na exibição:**
Nas configurações, o produtor escolhe como quer ver os números: quilos ou arrobas. Quando muda essa configuração, todos os números do app mudam de exibição instantaneamente — sem nenhum processamento extra, porque os dois valores já estão salvos.

**O que muda quando troca de unidade:**
- Campo de entrada na pesagem (label e placeholder)
- Resultado após pesagem
- GMD (kg/dia ou @/dia)
- Peso médio e total dos lotes
- Tabela de animais
- Histórico do animal
- Relatórios e projeções

**Padrão:** quilos (kg). O produtor pode trocar nas configurações a qualquer momento.

---

## 6. Telas e funcionalidades

### 6.1 Navegação principal

O app tem 4 abas na barra inferior:

| Aba | Ícone | Função |
|---|---|---|
| Início | 🏠 | Ação rápida + visão do rebanho |
| Pesar | ⚖️ | Registrar peso de animais |
| Lotes | 🗂️ | Gerenciar e ver lotes |
| Relatórios | 📊 | Desempenho e projeções |

As configurações ficam acessíveis por um ícone ⚙️ no canto do cabeçalho da tela Início. Configuração é ação rara — não ocupa espaço fixo na barra de navegação.

---

### 6.2 Tela Início

É a primeira tela que o produtor vê. Deve entregar ação em 2 toques.

**Componente 1 — Botão de ação principal:**
Se o produtor já pesou antes, aparece um botão grande verde: "⚖️ Continuar pesagem — [nome do último lote]". Ao tocar, vai direto para o campo de peso daquele lote, sem passar por nenhuma tela intermediária. Se nunca pesou antes, o botão diz "⚖️ Começar primeira pesagem" e abre o fluxo de seleção de lote.

**Componente 2 — Lista de lotes:**
Abaixo do botão, cada lote aparece como uma linha com: bolinha colorida de status (🟢🟡🔴), nome do lote, peso médio, quantidade de animais. Ao tocar em um lote, abre a tela interna daquele lote.

**Componente 3 — Resumo do rebanho:**
No rodapé da tela: total de animais cadastrados e GMD médio geral do rebanho com indicador de se está na meta ou não.

---

### 6.3 Tela Pesar

Fluxo em 3 passos. O produtor nunca fica perdido — o app guia cada etapa.

**Passo 1 — Selecionar lote:**
Lista de todos os lotes. Se o produtor já pesou antes, o último lote aparece destacado no topo com um botão "Continuar" — assim, para o caso mais comum (pesando o mesmo lote de ontem), é um toque só. Se quiser trocar de lote, escolhe outro na lista.

**Passo 2 — Registrar o animal:**
Dois campos:

*Campo 1 — Código do animal (opcional):*
O produtor começa a digitar o código. O app filtra em tempo real os animais do lote que combinam com o que foi digitado e mostra sugestões abaixo do campo. Se o produtor tocar em uma sugestão, o campo é preenchido e o app já mostra o último peso daquele animal. Se o código digitado não existir no lote, aparece a opção "Criar novo animal com código X". O app nunca cria animal automaticamente sem o produtor confirmar.

*Campo 2 — Peso:*
Campo grande, fonte enorme. O teclado numérico abre automaticamente ao chegar nessa tela. O label muda conforme a unidade configurada: "Peso (kg)" ou "Peso (@)". Se o animal foi identificado no campo anterior, aparece um aviso com o último peso registrado e há quantos dias foi.

No topo da tela, um contador mostra quantos animais foram pesados nessa sessão: "8 pesados hoje".

Botão "Registrar" fica desabilitado até o peso ser preenchido. Fica habilitado assim que há um número válido.

**Passo 3 — Resultado:**
Aparece imediatamente após registrar. Card colorido com o desempenho do animal:

- 🟢 **Excelente** — GMD 5% ou mais acima da meta
- 🟡 **Na Meta** — GMD entre 85% e 105% da meta
- 🔴 **Abaixo da Meta** — GMD abaixo de 85% da meta
- ⚪ **Primeira pesagem** — ainda sem GMD calculado

O card mostra: peso registrado, GMD atual, ganho desde a primeira pesagem, ganho esperado no mesmo período, e (se tiver GMD real) o valor estimado desse ganho em R$.

Abaixo do card: botões para mover o animal para outro lote (ação imediata para separação na balança) e botão "Próximo animal" que limpa o formulário e volta ao Passo 2 mantendo o mesmo lote.

---

### 6.4 Tela Lotes — Listagem

Lista de todos os lotes cadastrados. Cada card mostra:

- Bolinha colorida de status do lote (baseada no GMD médio vs meta)
- Nome do lote
- Peso médio dos animais e peso total do lote
- GMD médio do lote
- Contagem de animais por faixa de desempenho: 🟢 X · 🟡 X · 🔴 X · ⚪ X

Ao tocar no card, abre a tela interna do lote. Botão 🗑️ no card inicia o processo de exclusão do lote.

**Criar novo lote:**
Botão "+ Criar novo lote" no final da lista. O produtor digita o nome. O app atribui automaticamente uma cor e herda o peso de abate padrão das configurações. O lote fica disponível imediatamente.

**Excluir lote:**
Se o lote estiver vazio, confirma e exclui. Se tiver animais, pergunta para onde mover os animais antes de excluir — ou permite excluir tudo junto. O app nunca apaga animais sem o produtor escolher explicitamente.

---

### 6.5 Tela Interna do Lote

Acessada ao tocar em um lote na listagem.

**Cabeçalho com resumo:**
- Peso médio dos animais (na unidade configurada)
- Peso total do lote
- Quantidade de animais
- GMD médio do lote com indicador de status
- Meta de abate definida para o lote
- Quantos animais já atingiram o peso de abate: "8 prontos para abate"

**Campo de meta de abate:**
O produtor pode editar o peso de abate desse lote diretamente nessa tela. Ao tocar no campo, vira editável. Ao confirmar, salva e atualiza os cálculos de "prontos para abate" na hora.

**Tabela de animais:**
Formato de tabela compacta com uma linha por animal. Colunas: Código, Último Peso, GMD, Status, Ações.

Botões de ordenação acima da tabela: Peso ▲, Peso ▼, GMD ▲, GMD ▼. Ao tocar, a tabela reordena imediatamente.

Cada linha tem dois botões de ação:
- ⚖️ Pesar: vai direto ao Passo 2 da pesagem com lote e código pré-preenchidos
- 📋 Histórico: abre o histórico de pesagens daquele animal

---

### 6.6 Histórico do Animal

Acessado pelo botão 📋 na tabela de animais.

**Lista de pesagens:**
Tabela cronológica com todas as pesagens do animal: Data, Peso, GMD desde a pesagem anterior. A primeira pesagem mostra "—" na coluna GMD.

**Gráfico de linha:**
Evolução do peso ao longo do tempo. Eixo horizontal: datas. Eixo vertical: peso na unidade configurada. Um ponto por pesagem. O gráfico mostra claramente se o animal está ganhando, estabilizando ou perdendo peso.

---

### 6.7 Tela Relatórios

Visão consolidada do desempenho do rebanho. Só exibe dados baseados em registros reais do produtor.

**Cards de resumo:**
- Ganho total de peso do rebanho (soma do ganho de todos os animais com 2+ pesagens)
- Valor estimado em R$ (ganho em kg × preço do kg configurado) — aparece apenas quando há GMD real

**Gráfico Meta vs Real:**
Gráfico de barras com uma barra por lote mostrando o ganho real de peso versus a meta de ganho no mesmo período. Permite comparar lotes de forma imediata.

**Projeção de abate por lote:**

*Com apenas 1 pesagem (estimativa):*
O app mostra uma projeção baseada na meta configurada, com aviso claro de que é estimativa. Mostra: peso atual, meta de abate, quantos dias faltam, data prevista de abate. Gráfico com linha pontilhada. Sem valor em R$.

*Com 2 ou mais pesagens (dado real):*
O app usa o GMD real calculado. Mostra: GMD real vs meta (se está acima ou abaixo), data prevista de abate baseada no ritmo atual, valor estimado do lote na data de abate. Gráfico com linha sólida (real) e linha pontilhada (meta), permitindo ver se o lote está adiantado ou atrasado.

O aviso de "estimativa" desaparece assim que a segunda pesagem é registrada e o GMD real substitui a projeção.

---

### 6.8 Tela Configurações

Acessada pelo ícone ⚙️ no cabeçalho da tela Início.

**Seção Manejo:**
- Meta de GMD (ganho de peso por dia) — número editável. Afeta todos os cálculos de performance do app.
- Peso de abate padrão — número editável. Usado como padrão ao criar novos lotes.

**Seção Financeiro:**
- Preço do kg vivo em R$ — número editável. Usado para calcular valor estimado do ganho.

**Seção Unidade de Peso:**
Toggle simples entre Quilos (kg) e Arrobas (@). Muda a exibição de todo o app instantaneamente.

---

## 7. Regras de negócio

### GMD — Ganho Médio Diário
- Requer ao menos 2 pesagens em datas diferentes para ser calculado
- Fórmula: (último peso − primeiro peso) ÷ número de dias entre as duas datas
- Se o animal tem mais de 2 pesagens, usa sempre a primeira e a última data
- Pode ser negativo se o animal perdeu peso — isso gera status 🔴
- Armazenado em kg/dia internamente; exibido na unidade configurada

### Performance do animal
- 🟢 Excelente: GMD real ≥ 105% da meta
- 🟡 Na Meta: GMD real entre 85% e 105% da meta
- 🔴 Abaixo: GMD real < 85% da meta
- ⚪ Sem dados: menos de 2 pesagens

### Performance do lote
- Calculada com base no GMD médio de todos os animais com 2+ pesagens no lote
- Animais com apenas 1 pesagem não entram no GMD médio do lote

### Peso médio e total do lote
- Peso médio: média do último peso registrado de cada animal do lote
- Peso total: soma dos últimos pesos de cada animal do lote

### Prontos para abate
- Animal é considerado "pronto" quando seu último peso registrado é maior ou igual ao peso de abate definido no lote
- Se o lote não tiver peso de abate definido, o indicador não aparece

### Projeção de abate
- Com 1 pesagem: usa a meta de GMD configurada
- Com 2+ pesagens: usa o GMD real calculado
- Dias restantes = (peso de abate − peso médio atual) ÷ GMD usado
- Data prevista = hoje + dias restantes
- Valor estimado = peso de abate × número de animais × preço do kg (só com GMD real)

### Unidade de medida
- 1 arroba = 15 kg (peso vivo)
- Conversão feita uma vez, no momento do registro
- Armazenado: peso_kg e peso_arroba (ambos sempre salvos)
- Exibição: conforme configuração do produtor

---

## 8. Modelo de monetização — Freemium

### Filosofia
O plano gratuito é o que faz o app crescer. Produtor não indica app pago para o vizinho — indica o que usa de graça. O gratuito deve ser útil o suficiente para criar hábito, mas limitado o suficiente para que quem usa de verdade queira o plano pago.

### Plano Gratuito
Disponível para todos, sem cadastro, sem cartão.

**Limites:**
- Máximo de 1 lote
- Máximo de 20 animais no total
- Histórico de até 3 pesagens por animal
- Relatórios sem projeção de abate
- Sem exportação de dados

**O que funciona normalmente:**
- Pesagem individual com resultado de performance
- Histórico básico
- GMD calculado
- Meta vs Real no relatório

**Por que esses limites:**
1 lote e 20 animais são suficientes para o produtor ver o valor do app e criar o hábito. A limitação de 3 pesagens por animal significa que depois de 3 registros o produtor já quer o histórico completo. A projeção de abate é o dado mais valioso — fica no plano pago.

### Plano Pro — Mensal
Todos os recursos sem limitação.

**Inclui:**
- Lotes ilimitados
- Animais ilimitados
- Histórico completo de pesagens
- Projeção de abate com gráfico
- Exportação de dados (PDF ou planilha)
- Suporte prioritário

**Preço sugerido:** R$ 29,90/mês

### Plano Pro — Anual
Mesmo conteúdo do plano mensal com desconto.

**Preço sugerido:** R$ 249,00/ano (equivale a R$ 20,75/mês — 30% de desconto)

### Plano Vitalício
Pagamento único, acesso para sempre.

**Preço sugerido:** R$ 490,00 (equivale a menos de 17 meses do plano mensal)

O plano vitalício é importante para o lançamento: gera caixa rápido e cria usuários com skin in the game — quem pagou uma vez tem interesse em ver o produto crescer e tende a indicar mais.

### Como o limite é apresentado no app
Quando o produtor atinge um limite do plano gratuito, o app não bloqueia de forma abrupta. Mostra uma mensagem simples: "Você está usando o GadoApp gratuito. Para adicionar mais um lote, faça upgrade para o Plano Pro." Com botão de upgrade e botão de fechar. Sem pressão — o produtor decide quando está pronto.

### Momento de mostrar o upgrade
- Ao tentar criar o segundo lote (plano gratuito)
- Ao tentar adicionar o 21º animal
- Ao tentar ver a projeção de abate
- Ao tentar exportar dados
- Nunca no meio de uma pesagem — a ação principal nunca é interrompida

---

## 9. O que não existe nessa versão

Funcionalidades que foram discutidas mas não entram agora por não estarem completas:

- Sistema de despesas financeiras
- Controle de vacinas e vermifugações
- Registro de venda de lote
- Transferência de gado entre fazendas
- Comunidade e marketplace
- Preço do gado por região
- Sincronização em nuvem

Essas funcionalidades entram em versões futuras, quando o núcleo do app estiver validado com produtores reais.

---

## 10. O teste do SLC — critérios de aprovação

Antes de considerar o app pronto para uso, ele passa por este teste:

- O produtor consegue pesar um animal em menos de 30 segundos a partir de quando abre o app?
- Ao fechar e abrir de novo, ele sabe imediatamente o que fazer?
- Cada número exibido tem base em dado real que o próprio produtor registrou?
- Existe alguma seção que o produtor vai olhar e perguntar "o que é isso?"?
- O plano gratuito entrega valor real sem que o produtor sinta que foi enganado?

Se a resposta da quarta pergunta for sim em qualquer parte, essa parte sai ou é refeita antes de lançar.

---

## 11. Plataforma — Android e iOS

O app é construído em **React Native**. O mesmo código funciona em Android e iOS — não é necessário reescrever nada para publicar nos dois sistemas.

**Android — Google Play Store**
- Taxa única de U$25 para criar conta de desenvolvedor
- Publicação mais simples, revisão mais rápida
- Primeira plataforma a lançar

**iOS — Apple App Store**
- Taxa anual de U$99 para conta de desenvolvedor
- Revisão manual pela Apple — pode levar de 1 a 3 dias
- Regras mais rígidas, mas o código React Native é o mesmo
- Segunda plataforma, após validar no Android

---

## 12. Autenticação — Login e conta do produtor

O app exige login porque sem ele não é possível sincronizar dados na nuvem nem gerenciar o plano de pagamento de forma automática.

### Primeira vez que o produtor abre o app

Aparece uma tela de boas-vindas simples com três opções:

```
Bem-vindo ao GadoApp 🐄

[  Entrar com Google  ]
[  Entrar com Apple   ]
[  Entrar com e-mail  ]

Ao continuar, você concorda com os Termos de Uso.
```

### Entrar com Google
Um toque, sem digitar nada. O celular já sabe qual conta Google está ativa. Opção mais rápida para quem usa Android.

### Entrar com Apple
Obrigatório oferecer para quem usa iPhone — a Apple exige isso em qualquer app que ofereça login social. Um toque, sem digitar nada.

### Entrar com e-mail
Para quem prefere não usar conta Google ou Apple. O produtor digita e-mail e cria uma senha. O app envia um e-mail de confirmação antes de liberar o acesso.

### Nas vezes seguintes
O app lembra o login automaticamente. O produtor abre e vai direto para a tela principal — igual ao WhatsApp. Só precisa fazer login de novo se trocar de celular ou sair da conta manualmente.

### Logout
Disponível dentro das configurações, no final da tela. Ação rara — não precisa ser destaque.

### Tecnologia
Usar **Firebase Authentication** — gratuito, suporta Google, Apple e e-mail, integra direto com React Native. Não precisa construir sistema de login do zero.

---

## 13. Pagamento automático — RevenueCat

O sistema de pagamento é gerenciado pelo **RevenueCat**, solução padrão do mercado para apps mobile. Faz a ponte entre a loja (Google Play ou App Store) e o app.

### Fluxo completo

```
1. Produtor toca em "Fazer upgrade"
2. App exibe tela com os três planos
3. Produtor escolhe e toca em "Assinar"
4. Google Play ou App Store abre confirmação de pagamento
   (cartão já salvo na loja — um toque só)
5. Loja processa e confirma para o RevenueCat
6. RevenueCat notifica o app em segundos
7. App libera acesso ilimitado automaticamente
```

Você não vê cartão, não processa pagamento, não faz nada manual.

### Comissão das lojas
- 30% nos primeiros 12 meses de cada assinante
- 15% após 12 meses
- RevenueCat: gratuito até U$2.500 de receita mensal

### Cancelamento
O produtor cancela direto nas configurações da loja, sem falar com ninguém. O app detecta via RevenueCat e volta aos limites gratuitos no fim do período pago.

### Restaurar compra
Se trocar de celular ou reinstalar o app: botão "Restaurar compra" nas configurações. O RevenueCat verifica o histórico na loja e libera o acesso de volta sem cobrar de novo.

---

## 14. Dados na nuvem e funcionamento offline

### Arquitetura
Dados salvos em dois lugares simultaneamente:

**Local (SQLite no celular):** funciona sem internet. O produtor pesa no campo sem sinal e tudo é registrado normalmente.

**Nuvem (Firebase Firestore):** quando há internet, os dados sincronizam automaticamente em segundo plano — invisível para o produtor.

### Sem internet
O app funciona normalmente. Quando a internet voltar, os dados registrados offline sobem para a nuvem automaticamente.

### Troca de celular
O produtor faz login no novo celular com a mesma conta. O app baixa todos os dados da nuvem e em segundos está idêntico ao anterior. Zero perda de histórico.

---

## 15. Ordem de construção para o Claude Code

Construir nessa ordem. Cada etapa entrega uma versão funcional — o app nunca fica quebrado no meio do caminho.

```
Etapa 1 — Projeto React Native
  Criar projeto com Expo
  Configurar Firebase Authentication (Google, Apple, e-mail)
  Configurar Firebase Firestore (nuvem)
  Configurar SQLite local (offline)
  Configurar RevenueCat (pagamentos)
  Lógica de sincronização offline/online

Etapa 2 — Autenticação
  Tela de boas-vindas com três opções de login
  Entrar com Google
  Entrar com Apple
  Entrar com e-mail (+ confirmação por e-mail)
  Login automático nas sessões seguintes
  Logout nas configurações

Etapa 3 — Base de dados e funções globais
  Estrutura completa: config, lotes, animais (peso_kg e peso_arroba)
  Função global de exibição de peso (respeita unidade configurada)
  Função de cálculo de GMD
  Lógica de limites do plano gratuito

Etapa 4 — Configurações
  metaGMD, pesoAbate, precoKg, unidade (toggle kg/arroba)
  Logout
  Restaurar compra
  Acessada pelo ícone ⚙️ no cabeçalho

Etapa 5 — Lotes (listagem)
  Cards com nome, cor, peso médio, peso total, GMD médio, badges
  Criar e excluir lotes (com proteção de animais ao excluir)

Etapa 6 — Pesagem
  Passo 1: seleção de lote com memória do último usado
  Passo 2: autocomplete de código + campo de peso com auto-focus
  Passo 3: resultado com card de performance e opção de mover animal
  Contador de pesagens da sessão

Etapa 7 — Tela interna do lote
  Resumo (peso médio, total, GMD, prontos para abate)
  Campo de meta de abate editável
  Tabela de animais com ordenação
  Botões ⚖️ e 📋 por animal

Etapa 8 — Histórico do animal
  Lista de pesagens com datas e GMD entre pesagens
  Gráfico de linha com evolução de peso

Etapa 9 — Tela início
  Botão de continuar pesagem (último lote)
  Lista de lotes com status
  Resumo do rebanho

Etapa 10 — Relatórios
  Cards de ganho total e valor estimado
  Gráfico Meta vs Real por lote
  Projeção de abate (estimativa com 1 pesagem, real com 2+)

Etapa 11 — Monetização
  Tela de upgrade com os três planos
  Integração RevenueCat com Google Play e App Store
  Lógica de bloqueio nos limites do plano gratuito
  Botão "Restaurar compra"
  Mensagens de upgrade sem pressão (nunca no meio de uma pesagem)
```
