<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize()
{
    return true;
}
    public function rules()
{
    return [
        'client_name' => 'sometimes|required|string|max:255',
        'project_name' => 'sometimes|required|string|max:255',
        'description' => 'nullable|string',
        'status' => 'sometimes|required|in:Planning,In Progress,On Hold,Completed',
        'priority' => 'sometimes|required|in:Low,Medium,High',
        'start_date' => 'sometimes|required|date',
        'due_date' => 'sometimes|required|date|after_or_equal:start_date',
    ];
}
}
