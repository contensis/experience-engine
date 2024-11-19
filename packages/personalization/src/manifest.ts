export interface IManifestStore extends Manifest {
  cpid: string;
  pc: number;
  pageViews: number;
  currentPage?: string;
  previousPage?: string;
}

export class Manifest {}
