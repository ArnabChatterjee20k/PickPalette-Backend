import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Pinecone,IndexModel } from "@pinecone-database/pinecone";

import * as dotenv from "dotenv";
dotenv.config();
export default class VectorDB {
  private api_key: string;
  private db: Pinecone;
  public index: string;
  public dimension: number;
  constructor() {
    this.api_key = process.env.VECTOR_DB_API_KEY;
    this.db = new Pinecone({ apiKey: this.api_key });
    this.index = "pickpalette";
    this.dimension = 768; //https://js.langchain.com/docs/integrations/text_embedding/google_generativeai
  }
  async get_index() {
    const indices = await this.db.listIndexes();
    if (indices.indexes.length === 0) {
      const index = await this.db.createIndex({
        name: this.index,
        dimension: this.dimension,
        spec: {},
      });
    }
    return this.db.index(this.index);
  }

  async generate_embeddings(data:string){
    const embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey:process.env.GOOGLE_API_KEY,
      modelName: "embedding-001", // 768 dimensions
    });
    return embeddings.embedQuery(data)
  }
}