export const MATCH_MULTIPLIERS = {
    exhibition: 1,
    pcl_qualifier: 2,
    pcl_repechage: 2,
    pcl_quarterfinal: 3,
    pcl_semifinal: 4,
    pcl_final: 5,
} as const;

export const PCL_RESULT_BONUSES = {
    top4: 70,
    runner_up: 120,
    champion: 200,
} as const;

export const MATCH_TYPE_LABELS: Record<string, string> = {
    exhibition: "エキシビション",
    pcl_qualifier: "PCL予選",
    pcl_repechage: "PCL敗者復活戦",
    pcl_quarterfinal: "PCL準々決勝",
    pcl_semifinal: "PCL準決勝",
    pcl_final: "PCL決勝",
};

export const TOURNAMENT_RESULT_LABELS: Record<string, string> = {
    not_participated: "出場無し",
    qualifier_eliminated: "予選敗退",
    repechage_eliminated: "敗者復活戦敗退",
    top8: "BEST8",
    top4: "BEST4",
    runner_up: "準優勝",
    champion: "優勝",
};
