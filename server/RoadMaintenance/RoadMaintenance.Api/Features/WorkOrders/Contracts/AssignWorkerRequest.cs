using System.ComponentModel.DataAnnotations;

namespace RoadMaintenance.Api.Features.WorkOrders.Contracts;

public class AssignWorkersRequest
{
    [Required]
    public List<Guid> WorkerIds { get; set; } = [];
}