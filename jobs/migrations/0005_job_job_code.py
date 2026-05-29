import string
import random
from django.db import migrations, models


def generate_unique_codes(apps, schema_editor):
    """Populate unique job_code for all existing jobs."""
    Job = apps.get_model('jobs', 'Job')
    chars = string.ascii_uppercase + string.digits
    used_codes = set()
    for job in Job.objects.all():
        while True:
            code = 'BH-' + ''.join(random.choices(chars, k=4))
            if code not in used_codes:
                used_codes.add(code)
                job.job_code = code
                job.save(update_fields=['job_code'])
                break


class Migration(migrations.Migration):

    dependencies = [
        ('jobs', '0004_job_experience_max_job_experience_min'),
    ]

    operations = [
        # Step 1: Add job_code field WITHOUT unique constraint
        migrations.AddField(
            model_name='job',
            name='job_code',
            field=models.CharField(default='', max_length=10),
            preserve_default=False,
        ),
        # Step 2: Populate unique codes for existing rows
        migrations.RunPython(generate_unique_codes, migrations.RunPython.noop),
        # Step 3: Now add the unique constraint
        migrations.AlterField(
            model_name='job',
            name='job_code',
            field=models.CharField(default=None, editable=False, max_length=10, unique=True),
            preserve_default=False,
        ),
    ]
