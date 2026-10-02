<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use Illuminate\Http\Request;

class ProjectController extends Controller
{
    public function index()
    {
        return Project::all();
    }

    public function store(StoreProjectRequest $request)
    {
        $project = Project::create($request->validated());
        return response()->json($project, 201);
    }

    public function show(Project $project)
    {
        return $project;
    }

    public function update(UpdateProjectRequest $request, Project $project)
    {
        $project->update($request->validated());
        return response()->json($project);
    }

    public function destroy(Project $project)
    {
        $project->delete();
        return response()->noContent();
    }
}