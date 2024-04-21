type ClassifyResult = {
  positive: number;
  negative: number;
  neutral: number;
};

export async function classifySentiment(data: string): Promise<ClassifyResult> {
  const response = await fetch(
    "https://api-inference.huggingface.co/models/lxyuan/distilbert-base-multilingual-cased-sentiments-student",
    {
      headers: {
        // Authorization: `Bearer ${process.env.HUGGING_FACE_API_TOKEN}`,
        Authorization: `Bearer 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`,
      },
      method: "POST",
      body: JSON.stringify({ inputs: data }),
    }
  );
  const result: Array<Record<string, number>> = (await response.json())[0];
  //@ts-ignore
  return result.reduce(
    (lables: Object, cur: Record<string, number>) => {
      lables[cur.label] = cur.score;
      return lables;
    },
    { positive: 0, negative: 0, neutral: 0 }
  );
}