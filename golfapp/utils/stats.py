from golfapp.queries import round_queries
from golfapp.utils import handicap_helpers


def get_dates_for_range(first, last):
    num_day = last - first
    step = num_day // 10

    dates = []
    curr = first
    while curr < last:
        dates.append(curr)
        curr += step

    dates.append(last)

    return dates, step


def get_next_smallest_date_index(rounds, target_date):
    for i, round in enumerate(rounds):
        if round.date > target_date:
            return i - 1
    return len(rounds) - 1


def get_handicap_graph_list():
    rounds = round_queries.get_rounds(sort=True)
    rounds.reverse()

    first_date = rounds[0].date
    last_date = rounds[-1].date
    dates, step = get_dates_for_range(first_date, last_date)

    dates.pop(0)

    handicaps = []
    for date in dates:
        end_index = get_next_smallest_date_index(rounds, date)
        start_index = 0
        if end_index > 20:
            start_index = end_index - 20

        rounds_in_date_range = rounds[start_index : end_index + 1]
        handicap_for_date = handicap_helpers.calculate_handicap(rounds_in_date_range)
        handicaps.append(handicap_for_date)

    return [d.strftime("%m/%d/%Y") for d in dates], handicaps


def get_anitcap():
    rounds = round_queries.get_rounds(sort=True, max_rounds=20)
    anticap = handicap_helpers.calculate_handicap(rounds=rounds, reverse=True)

    return anticap


def get_averagecap():
    rounds = round_queries.get_rounds(sort=True, max_rounds=20)
    score_diffs = handicap_helpers.get_score_diffs(rounds=rounds)
    averagecap = round(sum(score_diffs) / len(score_diffs), 2)

    return averagecap
