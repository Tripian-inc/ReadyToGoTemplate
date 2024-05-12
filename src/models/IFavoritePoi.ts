import Model from '@tripian/model';

interface IFavoritePoi extends Model.Favorite {
  poi: Model.Poi;
}

export default IFavoritePoi;
