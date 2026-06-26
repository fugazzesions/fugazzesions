export const manifestoContent = {
  // Título grande del manifiesto. El span "accent" se renderiza en rojo.
  headline: {
    main: 'Somos personas normales a las que les gusta crear y compartir con la comunidad.'
    //accent: 'Punto.',
  },

  // Párrafos del manifiesto (texto plano, separados)
  paragraphs: [
    'Fugazzesions nació en una sesión cualquiera en Haití que terminó con una fugazzeta compartida entre todos nosotros. Lo que arrancó como una excusa para juntarnos entre amigos se fue armando de a poco: más patinadores, más rampas y más fugazzeta.',
    // El segundo párrafo usa <strong> para resaltar la frase clave
    'Hoy somos una comunidad que cree en lo simple. <strong>Pizza, patín y punto.</strong> Sin pretensiones y sin barreras. Si patinás (o querés aprender), este es tu lugar.',
  ],

  // Quote destacada del costado
  quote: {
    text: 'El patín es un estilo de vida.',
    sig: 'Manifiesto Fugazzesions',
  },
};

export type ValueVariant = 'default' | 'red' | 'green';

export const valuesContent: Array<{
  num: string;
  icon: string; // nombre del ícono de lucide
  title: string;
  text: string;
  variant: ValueVariant;
}> = [
  {
    num: '01',
    icon: 'Flame',
    title: 'Patinamos en comunidad',
    text: 'Acá no hay niveles, hay patinadores. Si recién empezás o si llevás veinte años, entrenas con nosotros igual.',
    variant: 'red',
  },
  {
    num: '02',
    icon: 'Pizza',
    title: 'El ritual de la pizza',
    text: 'La sesión termina con una pizza no es un detalle, es una forma de seguir compartiendo. Lo que se comparte en la mesa vale tanto como lo que pasa en la pista.',
    variant: 'default',
  },
  {
    num: '03',
    icon: 'Asterisk',
    title: 'Quad e Inline, sin grietas',
    text: 'Cuatro ruedas o en línea, el sentimiento es el mismo. Acá nadie está en bandos, todos somos patinadores.',
    variant: 'green',
  },
];

export const foundersContent = [
  {
    name: 'Martin Troncoso',
    role: 'Fundador de Plano Brand',
  },
  {
    name: 'Francisco Villasuso',
    role: 'Fundador de Sauzal Haus',
  },
  {
    name: 'Lucas Majorana',
    role: 'Fundador de Majorani',
  },
];

export const collaboratorsContent = {
  title: 'Y toda la banda',
  accent: 'la banda',
  text: 'Nada de esto funciona sin la gente que siempre aparece a dar una mano: amigos que arman las rampas, filman la sesh, piden pizza y aguantan el día entero.',
  footnote: 'Ustedes también son el corazon de Fugazzesions.',
};