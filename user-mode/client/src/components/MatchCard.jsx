function MatchCard({ match }) {
  return (
    <div className="border border-slate-800 rounded-lg p-4 bg-slate-900">
      <div className="flex justify-between text-sm text-slate-400 mb-1">
        <span>{match.group_name}</span>
        <span>{new Date(match.match_date).toLocaleString()}</span>
      </div>
      <div className="flex justify-between items-center">
        <span className="font-semibold">{match.team_home_name}</span>
        <span className="text-slate-400 text-xs">vs</span>
        <span className="font-semibold">{match.team_away_name}</span>
      </div>
      {match.status === "finished" && (
        <div className="mt-2 text-sm text-emerald-300">
          {match.home_score} - {match.away_score}
        </div>
      )}
    </div>
  );
}

export default MatchCard;
