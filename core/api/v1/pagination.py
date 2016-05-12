from rest_framework.pagination import LimitOffsetPagination


class LargeResultsLimitOffsetPagination(LimitOffsetPagination):
    max_limit = 250
    default_limit = 25

