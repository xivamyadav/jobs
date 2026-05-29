from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
import logging

logger = logging.getLogger(__name__)

class BroadcastService:
    @staticmethod
    def notify_dashboard(company_id, event_type="UPDATE"):
        try:
            channel_layer = get_channel_layer()
            if channel_layer:
                group_name = f'dashboard_{company_id}'
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        'type': 'dashboard_update',
                        'message': {
                            'event': event_type
                        }
                    }
                )
        except Exception as e:
            logger.error(f"Failed to broadcast dashboard update for company {company_id}: {e}")
