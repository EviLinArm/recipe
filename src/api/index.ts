import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
  organization: 'org-oJqA3X89TZTCik3UCUQadzTQ',
  dangerouslyAllowBrowser: true,
});

export function getDataFromGpt(grossery: string) {
  return openai.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: `
        Please create a just one recipe made from this ingredients ${grossery} and return in JSON format with this variable and this structure
        JSON SHOULD CONTAIN KEYS:
          title: string,
          ingredientsAmount: array of strings,
          stepsToCook: array of steps,
          timeToCook: string,
          difficulty: string
       `,
      },
    ],
    model: 'gpt-3.5-turbo',
  });
}

export const getImageFromGpt = (text: string) => {
  return openai.images.generate({
    prompt: text,
    size: '256x256',
    n: 1,
  });
};
