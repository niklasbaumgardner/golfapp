from flask import Blueprint, render_template, redirect, url_for, request
from flask_login import current_user, login_required
from golfapp.queries import course_queries, round_queries, user_queries
from golfapp.utils import stats as handicap_stats


stats_bp = Blueprint("stats_bp", __name__)


@stats_bp.route("/stats", methods=["GET"])
@login_required
def stats():
    if not current_user.handicap:
        return redirect(url_for("viewplayer_bp.index"))

    rounds = round_queries.get_rounds()

    if len(rounds) == 0:
        return redirect(url_for("viewplayer_bp.index"))

    # stats = {}
    # handicap_rounds = {}

    # if len(rounds) > 20:
    #     newest_rounds = rounds[:20]
    # else:
    #     newest_rounds = rounds

    # handicap_rounds["num_rounds"] = len(newest_rounds)
    # handicap_rounds["avg_score"] = round(
    #     sum(map(lambda x: x.score, newest_rounds)) / len(newest_rounds), 2
    # )
    # handicap_rounds["avg_gir"] = golf.get_avg_gir(newest_rounds)
    # handicap_rounds["avg_fir"] = golf.get_avg_fir(newest_rounds)
    # handicap_rounds["avg_putts"] = golf.get_avg_putts(newest_rounds)

    # if len(rounds) > 20:
    #     previous_rounds_stats = {}
    #     previous_rounds = rounds[20:]

    #     previous_rounds_stats["num_rounds"] = len(previous_rounds)
    #     previous_rounds_stats["avg_score"] = round(
    #         sum(map(lambda x: x.score, previous_rounds)) / len(previous_rounds), 2
    #     )
    #     previous_rounds_stats["avg_gir"] = golf.get_avg_gir(previous_rounds)
    #     previous_rounds_stats["avg_fir"] = golf.get_avg_fir(previous_rounds)
    #     previous_rounds_stats["avg_putts"] = golf.get_avg_putts(previous_rounds)

    #     stats["previous_rounds_stats"] = previous_rounds_stats

    #     all_rounds = {}

    #     all_rounds["num_rounds"] = len(rounds)
    #     all_rounds["avg_score"] = round(
    #         sum(map(lambda x: x.score, rounds)) / len(rounds), 2
    #     )
    #     all_rounds["avg_gir"] = golf.get_avg_gir(rounds)
    #     all_rounds["avg_fir"] = golf.get_avg_fir(rounds)
    #     all_rounds["avg_putts"] = golf.get_avg_putts(rounds)

    #     stats["all_rounds"] = all_rounds

    # TODO: return handicap, anticap, average of last 20
    # also a list a [[dates], [handicap for respective date]] to show a graph of handicap over time
    # stats["handicap_rounds"] = handicap_rounds
    dates, handicaps = handicap_stats.get_handicap_graph_list_for_user(
        user_id=current_user.id
    )
    anticap = handicap_stats.get_anitcap_for_user(user_id=current_user.id)
    averagecap = handicap_stats.get_averagecap_for_user(user_id=current_user.id)

    return render_template(
        "stats.html",
        handicap=current_user.handicap,
        line_graph_data={"dates": dates, "handicaps": handicaps},
        anticap=anticap,
        averagecap=averagecap,
    )


@stats_bp.get("/get_stats_data/<int:id>")
def get_stats_data(id):
    rounds = [r.to_dict() for r in round_queries.get_rounds_for_user_id(user_id=id)]

    dates, handicaps = handicap_stats.get_handicap_graph_list_for_user(user_id=id)
    anticap = handicap_stats.get_anitcap_for_user(user_id=id)
    averagecap = handicap_stats.get_averagecap_for_user(user_id=id)

    user = user_queries.get_user_by_id(user_id=id)
    return {
        "rounds": rounds,
        "chart_data": {"dates": dates, "handicaps": handicaps},
        "anticap": anticap,
        "averagecap": averagecap,
        "user": user.to_dict(),
    }


@stats_bp.route("/get_rounds", methods=["GET"])
@login_required
def get_rounds():
    rounds = [
        r.to_dict() for r in round_queries.get_rounds(sort=True, reverse_sort=True)
    ]
    return {"rounds": rounds}
