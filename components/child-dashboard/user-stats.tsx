import { Card, CardContent } from "../ui/card";

interface UserStatsProps {
  stats: any;
}

export function UserStats({ stats }: UserStatsProps) {
  return (
    <>
      <Card>
        <CardContent className="py-6">
          <h3 className="text-sm font-medium text-gray-500">Total dépensé</h3>
          <p className="text-2xl font-bold">{stats?.total_spent || 0}€</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-6">
          <h3 className="text-sm font-medium text-gray-500">Jeux achetés</h3>
          <p className="text-2xl font-bold">{stats?.total_games || 0}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="py-6">
          <h3 className="text-sm font-medium text-gray-500">Plateforme préférée</h3>
          <p className="text-2xl font-bold">{stats?.favorite_platform || 'N/A'}</p>
        </CardContent>
      </Card>
    </>
  );
} 