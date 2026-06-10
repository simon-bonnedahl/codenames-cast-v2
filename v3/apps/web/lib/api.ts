import { anyApi, type FunctionReference } from "convex/server";

type GamesApi = {
  create: FunctionReference<"mutation">;
  getControllerByDisplayCode: FunctionReference<"query">;
  getPublicByDisplayCode: FunctionReference<"query">;
  revealCell: FunctionReference<"mutation">;
};

export const api = anyApi as typeof anyApi & {
  games: GamesApi;
};
