<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'client_name',
        'project_name',
        'description',
        'status',
        'priority',
        'start_date',
        'due_date',
    ];
}
