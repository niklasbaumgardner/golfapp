from golfapp.models import Subscriber, Subscription
from golfapp import db


def create_subscription_for_user(user_id):
    subscription = Subscription(subscribed_to=user_id)
    db.session.add(subscription)
    db.session.commit()


def create_subscriber_for_subscription(subscribtion_id, user_id):
    subscriber = Subscriber(subscribtion_id=subscribtion_id, user_id=user_id)
    db.session.add(subscriber)
    db.session.commit()


def get_subscription_for_user(user_id):
    return Subscription.query.filter_by(subscribed_to=user_id).first()


def get_subscribers_by_subscription_id(subscription_id):
    return Subscriber.query.filter_by(subscribtion_id=subscription_id).all()


def get_subscribers_for_user(user_id):
    subscription = get_subscription_for_user(user_id=user_id)
    return get_subscribers_by_subscription_id(subscription_id=subscription.id)
