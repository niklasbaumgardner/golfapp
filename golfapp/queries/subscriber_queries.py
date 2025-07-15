from golfapp.models import Subscriber, Subscription
from golfapp import db
from sqlalchemy import insert, select


def create_subscription_for_user(user_id):
    stmt = insert(Subscription).values(subscribed_to=user_id)
    db.session.execute(stmt)
    db.session.commit()


def create_subscriber_for_subscription(subscribtion_id, user_id):
    stmt = insert(Subscriber).values(subscribtion_id=subscribtion_id, user_id=user_id)
    db.session.execute(stmt)
    db.session.commit()


def get_subscription_for_user(user_id):
    stmt = select(Subscription).where(Subscription.subscribed_to == user_id).limit(1)
    return db.session.scalars(stmt).first()


def get_subscribers_by_subscription_id(subscription_id):
    stmt = select(Subscriber).where(Subscriber.subscribtion_id == subscription_id)
    return db.session.scalars(stmt).all()


def get_subscribers_for_user(user_id):
    subscription = get_subscription_for_user(user_id=user_id)
    if not subscription:
        return
    return get_subscribers_by_subscription_id(subscription_id=subscription.id)
