function PointsTable({ rows }) {
  return (
    <table className="min-w-full text-sm border border-slate-800">
      <thead className="bg-slate-900 text-slate-300">
        <tr>
          <th className="px-3 py-2 text-left">Team</th>
          <th className="px-3 py-2 text-center">P</th>
          <th className="px-3 py-2 text-center">W</th>
          <th className="px-3 py-2 text-center">L</th>
          <th className="px-3 py-2 text-center">D</th>
          <th className="px-3 py-2 text-center">Pts</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.team_id} className="border-t border-slate-800">
            <td className="px-3 py-2">{row.team_name}</td>
            <td className="px-3 py-2 text-center">{row.played}</td>
            <td className="px-3 py-2 text-center">{row.won}</td>
            <td className="px-3 py-2 text-center">{row.lost}</td>
            <td className="px-3 py-2 text-center">{row.drawn}</td>
            <td className="px-3 py-2 text-center font-semibold">
              {row.points}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default PointsTable;
