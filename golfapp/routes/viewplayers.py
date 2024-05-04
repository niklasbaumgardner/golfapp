from flask import Blueprint, render_template
from golfapp.queries import user_queries


viewplayers_bp = Blueprint("viewplayers_bp", __name__)


@viewplayers_bp.route("/view_players", methods=["GET"])
def view_players():
    users = [u.to_dict() for u in user_queries.get_visible_users()]
    users.sort(lambda u: u["handicap"]["handicap"])
    return render_template("viewplayers.html", users=users)
